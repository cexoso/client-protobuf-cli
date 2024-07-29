#! /bin/bash
#
npx ts-node src/index.ts \
  --path test-protos/example.proto \
  --service-name example_service \
  --out-dir ../example \

