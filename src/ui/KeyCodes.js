let KeyCodes = {
	ReturnOrEnter: 13,
	DeleteOrBackspace: 8,
	Tab: 9,
	Space: 32,
	
	ShiftModifier: 16,
	OptionModifier: 18,
	CommandModifier: 91,
	
	isModifier(keyCode) {
		switch (keyCode) {
			case KeyCodes.ShiftModifier:
			case KeyCodes.OptionModifier:
			case KeyCodes.CommandModifier:
				return true;
			default:
				return false;
		}
	}
};

module.exports = KeyCodes;