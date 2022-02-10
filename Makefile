local:
	serverless offline

deployfaster:
	sls deploy function -f api

deploy:
	sls deploy

logs:
	sls logs --function api --tail
