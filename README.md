# ExamGuard — Question Bank Exposure Limits

> **Microservices-Based Assessment Paper Generator with Exposure Limit Enforcement & Kafka Event Streaming**

ExamGuard is an enterprise-grade university assessment platform that prevents questions in an outcome-tagged question bank from being overused across academic cohorts. The platform tracks exposure counters, selects eligible questions according to course outcome requirements (CO1–CO4), enforces strictly non-repeatable limits, and transparently flags unsatisfied outcome coverage rather than reusing exhausted questions.

---

## 1. Quick Start

### Prerequisites
- Node.js >= 18.0
- npm >= 9.0

### Installation & Development Server
```bash
# 1. Install dependencies
npm install

# 2. Launch Vite development server
npm run dev
```

The application runs on `http://localhost:3000`.

---

## 2. Key Architecture & Demonstration Scenarios

### A. The Core Invariant Formula
$$\text{remaining} = \max(0, \text{maximumExposure} - \text{exposureCount})$$

- If $\text{remaining} = 0$, the question status transitions to **Exhausted**.
- **Rule:** An exhausted question must never be selected by the PaperAssembly service for that cohort.
- The platform never fabricates extra questions or repeats exhausted ones to hide coverage gaps.

### B. Critical Demonstration Scenario: Exhausted CO2 Questions
In cohort **CSE-2026-A**:
- **Q201**: CO2, Exposure Count: 2, Max: 2 (**Exhausted**)
- **Q202**: CO2, Exposure Count: 2, Max: 2 (**Exhausted**)
- **Q203**: CO2, Exposure Count: 1, Max: 2 (**Available**, 1 remaining)

When an exam author requests **3 CO2 questions**:
1. Q201 and Q202 are strictly excluded.
2. Q203 is the only eligible CO2 question selected.
3. Outcome report displays:
   - Required CO2: 3
   - Selected CO2: 1
   - Missing CO2 coverage: 2
   - Paper Status: **PARTIAL**
   - Warning banner: *“CO2 coverage gap detected. Only 1 of 3 required questions could be selected. Two additional CO2 questions are unavailable because the eligible question pool is exhausted. No exhausted question was repeated.”*

> Click **“Run Exhaustion Demo”** in Paper Assembly to trigger this deterministic scenario.

---

## 3. Microservices Topology

| Service | Port | Database | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **API Gateway** | `8080` | None | Spring Cloud Gateway, JWT validation, CORS, routing |
| **Eureka Server** | `8761` | In-memory | Service registry & heartbeat health checks |
| **QuestionBank** | `8081` | PostgreSQL (JPA) | Question CRUD, CO tagging, marks, difficulty |
| **ExposureLedger**| `8082` | PostgreSQL (Ledger)| Cohort exposure calculation with optimistic locking |
| **PaperAssembly** | `8083` | PostgreSQL (Papers)| Guided question assembly & Kafka producer |
| **WorkflowTracker**| `8084`| PostgreSQL (Audit) | Kafka consumer on `soa.s09.t14.events` |
| **Kafka Broker** | `9092` | Log Segments | Distributed event streaming broker |

---

## 4. Kafka Event Contract

- **Topic:** `soa.s09.t14.events`
- **Event Type:** `QuestionPaperGenerated`

```json
{
  "eventId": "evt-1001",
  "eventType": "QuestionPaperGenerated",
  "paperId": "PAPER-1001",
  "cohortId": "CSE-2026-A",
  "status": "PARTIAL",
  "selectedQuestionIds": ["Q203"],
  "unsatisfiedCoverage": {
    "CO2": 2
  },
  "occurredAt": "2026-10-26T15:00:00Z",
  "schemaVersion": 1
}
```

---

## 5. Documented Backend REST API Contracts

### Question Bank Service
- `GET /api/questions`: Paginated question list with query parameters (`courseOutcome`, `difficulty`, `status`, `search`).
- `GET /api/questions/{id}`: Single question record.
- `POST /api/questions`: Create question (Requires `questionReviewer` authority).
- `PUT /api/questions/{id}`: Update question text, tags, marks, or max exposure.
- `DELETE /api/questions/{id}`: Soft/hard delete question from active bank.

### Exposure Ledger Service
- `GET /api/cohorts`: Retrieve all registered academic cohorts.
- `GET /api/exposures/{cohortId}`: Ledger records for all questions in cohort with computed remaining capacity.
- `GET /api/exposures/{cohortId}/questions/{questionId}`: Single question exposure status.

### Paper Assembly Service
- `POST /api/papers/generate`: Submit paper request with required CO counts (Requires `examAuthor` authority).
- `GET /api/papers`: Historical assessment papers archive.
- `GET /api/papers/{paperId}`: Assessment paper details with question selections and gap breakdown.

### Workflow Tracker & Actuator
- `GET /api/events`: Audited Kafka events consumed from topic `soa.s09.t14.events`.
- `GET /api/workflows/{paperId}`: End-to-end lifecycle step audit.
- `GET /actuator/health`: Spring Boot Actuator cluster health status.

---

## 6. Access & Security Matrix (JWT)

- **`examAuthor` (`Prof. Ramesh Narayanan`)**:
  - `POST /api/papers/generate` &rarr; **HTTP 200 OK** (Authorized)
- **`questionReviewer` (`Dr. Anita Deshmukh`)**:
  - `POST /api/papers/generate` &rarr; **HTTP 403 FORBIDDEN** (Access Denied)
  - `POST /api/questions` &rarr; **HTTP 201 CREATED** (Authorized)

Use the **Access & Security** tab to verify these policies dynamically.
