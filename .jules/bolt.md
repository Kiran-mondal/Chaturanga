## 2026-08-24 - Minimax Key Parsing Bottleneck
**Learning:** In the Chaturanga engine, string keys representing 8x8 board coordinates (e.g., '7-5') were being parsed inside the hot loop of the minimax algorithm using `key.split('-').map(Number)`. This creates huge overhead via array allocations during deep game tree evaluations.
**Action:** Replace split operations with fast string character code math `key.charCodeAt(0) - 48` for single-digit 8x8 grid bounds. Always watch out for string manipulations inside recursive algorithm hot paths.
