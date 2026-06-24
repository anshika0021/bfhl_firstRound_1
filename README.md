<img width="723" height="390" alt="{915D1F85-76B8-4DB3-9620-E7B70052CA59}" src="https://github.com/user-attachments/assets/9b262c81-1367-48cf-81c0-8ec0648ea35f" />

<img width="707" height="537" alt="{5231ACCC-2C31-46B3-BC7F-76B91BA3BD9C}" src="https://github.com/user-attachments/assets/1330830b-afd0-4b3f-bdc1-3d762add276d" />




# BFHL Node Hierarchy API

POST `/bfhl` — accepts array of node edge strings, returns hierarchies, cycles, invalid/duplicate entries.

## Local Run
```bash
cd backend
npm install
node index.js
# Server at http://localhost:3000
```

## Test
```bash
curl -X POST http://localhost:3000/bfhl \
  -H "Content-Type: application/json" \
  -d '{"data":["A->B","A->C","B->D","X->Y","Y->Z","Z->X","hello","1->2"]}'
```

## Deploy
- Backend: Deploy `backend/` folder on Render as a Node.js web service
- Frontend: Deploy `frontend/` folder on Netlify (drag & drop)
