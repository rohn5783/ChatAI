# TODO - Socket.IO Unauthorized (No token provided)

## Step 1: Add socket auth (cookie/JWT) to backend
- Update `backend/sockets/server.socket.js` to:
  - Read `token` from socket handshake cookies
  - Verify JWT using `process.env.JWT_SECRET`
  - Attach `socket.userId`
  - Disconnect or ignore events when token is missing/invalid

## Step 2: Ensure frontend sends credentials correctly
- Confirm `frontend/src/features/auth/service/chat.socket.js` uses `withCredentials: true` and correct origin.

## Step 3: Add authenticated socket event handlers (if missing)
- Identify the event name(s) used by the frontend (`socket.emit(...)`).
- Implement corresponding `socket.on(...)` handlers on backend that require `socket.userId`.

## Step 4: Test
- Run backend.
- Log token + userId on socket connection to confirm auth.
- Retry sending message; verify error is gone.

