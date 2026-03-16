# Gemini Review Template — Cross-Document Consistency

Przy każdym review sprawdź następujące powiązania krzyżowe:

## Matryca zależności dokumentów

```
Normy Zewnętrzne (N)
    ↓ definiuje architekturę
Policy Registry (A)
    ↓ definiuje reguły NK
Deliverable B (B)
    ↓ implementuje technicznie
Deliverable C (C)
    ↓ opisuje workflowy
```

## Checklist spójności (51 konceptów)

### Core architecture (musi być w: A, B, C, N)
- [ ] OPA WASM in-process
- [ ] Single-Pass Evaluation
- [ ] Transactional Outbox
- [ ] 7 workflowów (W1-W7)
- [ ] 14 reguł core Sprint 0
- [ ] Dry-Run API
- [ ] IdP Step-Up (nie natywny FIDO2)
- [ ] break_glass w publicznym R-BOM
- [ ] External Trust Anchor / RFC3161 TSA
- [ ] Public Transparency Log
- [ ] Evidence Package / certo verify
- [ ] 3 workery SoD (Operational, Evidence, Sentinel)
- [ ] NK-021 Evidence Materiality
- [ ] NK-022 Funding Independence
- [ ] SUPERSEDED status / W7 Rating Revision
- [ ] APPROVE_SHREDDING
- [ ] OVERRIDE_SANCTIONS

### Technical details (musi być w: B, C)
- [ ] Zero Redis
- [ ] Graphile Worker
- [ ] transaction_timestamp() jako time oracle
- [ ] PRE_PUBLISH_INTENT
- [ ] OPA Bundle API z podpisami
- [ ] Policy Pinning per case
- [ ] Hash ciphertext (nie plaintext PII)
- [ ] normative_path[] w R-BOM
- [ ] DISTINCT organ_id >= 2
- [ ] S3 Governance Mode / bucket Default Retention
- [ ] DEK per podmiot (nie globalny)
- [ ] Blind Index (email_hash)

### Roadmap Sprint 2 (musi być w: B, C, N)
- [ ] Normative Graph (norm-driven)
- [ ] Post-Quantum / Kyber
- [ ] CDC Debezium
- [ ] UBO Unrolling
- [ ] PBAC
- [ ] Automated DSAR
- [ ] Database Branching
- [ ] Auto-Remediation / IaC

## Reguły weryfikacji

1. **Nowa reguła NK** → musi być w: A (definicja), B (mapowanie), C (matryca), N (odniesienie)
2. **Nowy decision point** → musi być w: A (sekcja 6.6), B (tabela 4.3), C (workflow)
3. **Zmiana architektury** (np. Redis→Postgres) → musi być zaktualizowana we WSZYSTKICH dokumentach
4. **Nowy workflow** → musi być w: C (pełny diagram), B (decision points), A (mapowanie), N (sekcja 9.3)

## Liczby do weryfikacji

| Parametr | Wartość | Źródło |
|----------|---------|--------|
| Hard Gates (katalog) | 22 | A |
| Hard Gates Sprint 0 (core) | 14 | B |
| Soft Gates | 22 | A |
| Workflowy | 7 | C |
| Decision points | 9 | B |
| ADR | 7 | B |
| Tabele DB | 13 | B |
| Workery SoD | 3 | B, C |
