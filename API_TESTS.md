# Quick API Tests

Health:

```bash
curl http://localhost:5000/api/health
```

List schemes:

```bash
curl http://localhost:5000/api/schemes
```

Match without login:

```bash
curl -X POST http://localhost:5000/api/match \
  -H "Content-Type: application/json" \
  -d '{"profile":{"age":25,"gender":"female","category":"SC","occupation":"tailor"}}'
```
