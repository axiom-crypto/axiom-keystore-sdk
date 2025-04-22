# Keystore SDK Deposit-Withdraw Example

This example program:
1. Deposits some funds into a keystore account by sending an [L1-initiated](https://keystore-specs.axiom.xyz/protocol/sequencing.html#l1-initiated-transactions) [`Deposit` transaction](https://keystore-specs.axiom.xyz/keystore/tx-format.html#deposits).
2. Then withdraws the funds back by sending a [`Withdrawal` transaction](https://keystore-specs.axiom.xyz/keystore/tx-format.html#withdrawals).

You can run this example by running:

```bash
pnpm install
pnpm start
```