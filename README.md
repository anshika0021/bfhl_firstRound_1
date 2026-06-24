<img width="758" height="508" alt="{63F0A660-5403-4AF9-A3A6-A32A0DE541FF}" src="https://github.com/user-attachments/assets/bae3d21e-9e72-4d2f-90b6-19dac40c88ef" />



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
