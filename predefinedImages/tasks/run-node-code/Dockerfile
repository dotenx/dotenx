ARG FUNCTION_DIR="/function"

FROM node:14-buster as build-image

# Include global arg in this stage of the build
ARG FUNCTION_DIR

# Install aws-lambda-cpp build dependencies
RUN apt-get update && \
    apt-get install -y \
    g++ \
    make \
    cmake \
    unzip \
    libcurl4-openssl-dev



WORKDIR ${FUNCTION_DIR}

COPY ./package*.json ${FUNCTION_DIR}

RUN npm install

COPY ./* ${FUNCTION_DIR}
# Grab a fresh slim copy of the image to reduce the final size
FROM node:14-buster-slim

# Include global arg in this stage of the build
ARG FUNCTION_DIR

# Set working directory to function root directory
WORKDIR ${FUNCTION_DIR}

# Copy in the built dependencies
COPY --from=build-image ${FUNCTION_DIR} ${FUNCTION_DIR}

# Downloads the Lambda Runtime Interface Emulator (RIE)
ADD https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/latest/download/aws-lambda-rie /usr/bin/aws-lambda-rie

RUN chmod +x /usr/bin/aws-lambda-rie
RUN chmod +x entry.sh

# ENTRYPOINT ["/usr/local/bin/npx", "aws-lambda-ric"]
ENTRYPOINT ["./entry.sh"]
CMD ["index.handler"]