## Things to do after this version

- Wallet context reuse for embedded widget
  - Create two exports:
    - `WidgetStandalone`: includes `QueryClientProvider`, `SuiClientProvider`, and `WalletProvider` (current behavior).
    - `WidgetEmbedded`: assumes the host app already provides those providers and only uses hooks (`useCurrentAccount`, `useSuiClient`, etc.).
  - Optionally auto-detect existing providers: attempt to use existing contexts; if unavailable, fall back to internal providers.
  - Acceptance criteria:
    - When embedded inside a host app already connected to a wallet, the widget shows the same connected account without prompting to reconnect.
    - When used standalone, it still works exactly as today.
  - Notes:
    - If rendered in an iframe (different origin), context cannot be reused; only autoConnect persistence applies.
    - Document the required provider setup for hosts using `WidgetEmbedded`.


