const utils = require("utils");
const delegate = require("component.delegate");
const messageBusHostChannel = require("component.messagebus.host.channel");
const logging = require("logging");
logging.config.add("MessageBus Publisher");

module.exports = { 
    handle: async (callingModule, { host, port }) => {
        const registerModule = `component.messagebus.publisher`;
        const name = `global`;
        delegate.register(registerModule, name, async ({ newHost, hosts }) => { //register host with publisher
          console.log("");
        });
        await messageBusHostChannel.handle({ host, port });
    }
};