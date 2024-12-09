DOCKER_CLI=docker

.PHONY: up
up:
	${DOCKER_CLI} compose up --build -d --remove-orphans

.PHONY: stop
stop:
	${DOCKER_CLI} compose stop --timeout 1

.PHONY: clean
clean: stop
	${DOCKER_CLI} compose rm -f -v

