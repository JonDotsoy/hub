import protobuf from "protobufjs";
import "protobufjs/ext/descriptor";

const [_, _1, protofile] = process.argv;

const ns = protobuf.loadSync(protofile).resolveAll();

// @ts-ignore
const desc = ns.toDescriptor();

console.log(JSON.stringify(desc.toJSON(), null, 2));
