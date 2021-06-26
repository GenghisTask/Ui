# Sometime I type `make` by mistake instead of `npm` :
run:
build:
dev:
start:
init:
install:
%:
	@if [ -z $(RUN_ONCE) ]; then\
        npm $(MAKECMDGOALS);\
    fi
	$(eval RUN_ONCE := 1)