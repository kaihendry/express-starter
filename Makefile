deployfaster:
	sls deploy function -f api

deploy:
	sls deploy

local:
	serverless offline

logs:
	sls logs --function api --tail
