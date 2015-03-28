var MicroEvent = require('microevent');

module.exports = {
	mixin: function(object) {
		object.on = MicroEvent.prototype.bind;
		object.trigger = MicroEvent.prototype.trigger;
		object.off = MicroEvent.prototype.unbind;
	}
};