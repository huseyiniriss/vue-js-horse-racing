# Architecture decisions

See also the [design system](../design-system.md).

Short records of the decisions that shape this codebase: the context, the choice,
and what it costs. New decisions get the next number; superseded ones stay, marked as such.

| #                                       | Decision                                             |
| --------------------------------------- | ---------------------------------------------------- |
| [0001](0001-feature-based-structure.md) | Feature-based structure with enforced boundaries     |
| [0002](0002-race-decided-up-front.md)   | The race is decided up front, then played back       |
| [0003](0003-seeded-randomness.md)       | All randomness is seeded                             |
| [0004](0004-state-management.md)        | Two Pinia setup stores and an explicit state machine |
| [0005](0005-animation-clock.md)         | One clock, one reactive value per frame              |
| [0006](0006-testing-strategy.md)        | Testing strategy                                     |
| [0007](0007-code-conventions.md)        | Code conventions                                     |
| [0008](0008-horses-and-silks.md)        | Horses from Muybridge's gallop, identified by silks  |
