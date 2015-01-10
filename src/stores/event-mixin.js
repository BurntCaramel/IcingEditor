var MicroEvent = require('microevent');

module.exports = {
	mixin: function(store) {
		store.on = MicroEvent.prototype.bind;
		store.trigger = MicroEvent.prototype.trigger;
		store.off = MicroEvent.prototype.unbind;
	}
};