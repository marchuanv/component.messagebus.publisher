const utils = require("utils");
const delegate = require("component.delegate");
const messageBusHostChannel = require("component.messagebus.host.channel");
const request = require("component.request");
const logging = require("logging");
logging.config.add("MessageBus Publisher");
const subscribers = [];

module.exports = { 
    handle: async ({ host, port }) => {
        delegate.register(`component.messagebus.publisher`, `global`, async ({ channel, data, fromhost, fromport }) => {
          const filteredSubscribers = subscribers.filter(x => x.channel.name === channel.name && x.channel.port === channel.port);
          for(const subscriber of filteredSubscribers){
            await request.send({ 
              host: subscriber.host,
              port: subscriber.port,
              path: `/${channel.name}`,
              method: "POST",
              headers: { username: subscriber.username, fromhost, fromport }, 
              data,
              retryCount: 1
            });
          };
          return { statusCode: 200, statusMessage: "Publish Successful", headers: {}, data: "" };
        });
        delegate.register(`component.messagebus.subscriber`, `global`, async ({ username, channel, fromhost, fromport }) => {
          subscribers.push({ username, channel, host: fromhost, port: fromport });
          return { statusCode: 200, statusMessage: "Subscribe Successful", headers: {}, data: "" };
        });
        await messageBusHostChannel.handle({ host, port });
    }
};