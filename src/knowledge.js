// Approved product content (mock). Text must only change via content review.
// Keywords match whole words; a trailing "*" matches any word starting with the stem.

export const MAIN_MENU = [
  { label: "Pair my sensor", goto: "pair" },
  { label: "Check my technique", goto: "technique" },
  { label: "Sensor lights", goto: "lights" },
  { label: "Missed a dose", goto: "missed_dose" },
  { label: "Side effects", goto: "side_effects" },
  { label: "I feel unwell", goto: "sx_check_1" }
];

const BACK = [{ label: "Main menu", goto: "welcome" }];

export const topics = [
  { node: "not_recording", keywords: ["not record*", "didn't record*", "didnt record*", "isn't record*", "not logg*", "not count*", "didn't count", "didnt count", "not showing", "not show up", "missing dose*", "missing puff*", "wrong count", "history", "not register*", "didn't register"] },
  { node: "pair", keywords: ["pair*", "connect*", "bluetooth", "sync*", "link", "set up", "setup", "new phone", "can't find", "cant find", "not finding", "won't connect", "wont connect"] },
  { node: "lights", keywords: ["light*", "led", "flash*", "blink*", "red", "green", "amber", "orange", "blue light", "battery", "charg*", "flat", "dead", "power*"] },
  { node: "technique", keywords: ["technique", "how to use", "how do i use", "how should i use", "doing it right", "using it right", "properly", "correctly", "spacer", "shake", "breathe in", "puff"] },
  { node: "cleaning", keywords: ["clean*", "wash*", "wet", "water", "dirty", "rain", "dropped", "splash*"] },
  { node: "new_inhaler", keywords: ["new inhaler", "replace*", "refill*", "empty", "ran out", "run out", "running out", "running low", "dose counter", "counter", "how many left", "doses left", "puffs left", "prescription", "swap*"] },
  { node: "missed_dose", keywords: ["missed", "miss a dose", "skipped", "forgot my", "forgot to take", "didn't take", "didnt take"] },
  { node: "reminders", keywords: ["remind*", "alarm*", "notification*", "alert*", "forget*", "forgot"] },
  { node: "privacy", keywords: ["data", "privacy", "private", "share", "sharing", "who can see", "gdpr", "delete my", "my information"] },
  { node: "travel", keywords: ["travel*", "fly", "flying", "flight*", "plane", "airport", "holiday*", "abroad", "trip"] },
  { node: "about", keywords: ["what is", "what's the sensor", "what does it do", "how does it work", "about the sensor", "breathlink"] },
  { node: "thanks", keywords: ["thank*", "cheers", "bye", "goodbye", "that's all", "that helped", "brilliant", "great"] },
  { node: "welcome", keywords: ["main menu", "menu", "hello", "hi", "hey", "start", "help", "something else", "options"] }
];

export const contentNodes = {
  welcome: {
    source: "SUPPORT",
    text: "Hi, I'm the BreathLink assistant. I can help with your inhaler sensor, using your inhaler, reminders and doses.\nI use approved product information only, and I can't replace your doctor, nurse or pharmacist.",
    ask: "What can I help with today? You can type in your own words.",
    options: MAIN_MENU
  },
  fallback: {
    source: "SUPPORT",
    text: "Sorry, I'm not sure I understood that. I can only answer using approved BreathLink information.",
    ask: "Could you say it another way, or pick a topic?",
    options: MAIN_MENU
  },
  thanks: {
    source: "SUPPORT",
    text: "You're welcome. Take care, and remember: if your breathing gets worse, follow your action plan and get help.",
    options: BACK
  },
  about: {
    source: "IFU",
    text: "BreathLink is a small sensor that clips onto your usual inhaler. It doesn't change your medicine or how the inhaler works.\nIt records when you take a puff, checks your technique, and sends this to the app so you and (if you choose) your care team can see it.",
    ask: "Would you like help setting it up?",
    options: [{ label: "Yes, pair my sensor", goto: "pair" }, { label: "No thanks", goto: "welcome" }]
  },

  pair: {
    source: "IFU",
    text: "To pair your sensor:\n1. Turn on Bluetooth on your phone.\n2. Open the BreathLink app and tap Add device.\n3. Hold the sensor button for 3 seconds.",
    ask: "Is the sensor light flashing blue?",
    options: [{ label: "Yes", goto: "pair_flashing" }, { label: "No", goto: "pair_no_light" }]
  },
  pair_flashing: {
    source: "IFU",
    text: "Great, that means it's ready. Keep your phone within 1 metre. The app should find it within 30 seconds.\nIf you see more than one sensor, pick the one ending in the code printed on the back of your sensor.",
    ask: "Did it connect?",
    options: [{ label: "Yes", goto: "pair_done" }, { label: "No", goto: "pair_troubleshoot" }]
  },
  pair_no_light: {
    source: "IFU",
    text: "If there's no blue light, the battery may be low. Charge the sensor with the USB-C cable for 30 minutes, then hold the button for 3 seconds again.",
    ask: "Does any light come on while it's charging?",
    options: [{ label: "Yes", goto: "pair" }, { label: "No", goto: "device_fault" }]
  },
  pair_troubleshoot: {
    source: "IFU",
    text: "Let's try a reset:\n1. Turn Bluetooth off and on again.\n2. Close and reopen the BreathLink app.\n3. In your phone's Bluetooth settings, forget any old \"BreathLink\" devices.\n4. Try pairing again.",
    ask: "Has that fixed it?",
    options: [{ label: "Yes, it's connected", goto: "pair_done" }, { label: "No, still stuck", goto: "device_fault" }]
  },
  pair_done: {
    source: "IFU",
    text: "You're all set. Each puff will now be recorded automatically, and you'll see a green flash each time.",
    options: BACK
  },

  device_fault: {
    source: "SUPPORT",
    text: "It sounds like the sensor may have a fault. Your inhaler still works normally without the sensor, so keep taking your medicine as prescribed.\nYou can log doses by hand in the app until it's sorted.",
    ask: "Would you like to contact BreathLink support for a replacement sensor?",
    options: [{ label: "Yes, contact support", goto: "esc_handoff" }, { label: "Not now", goto: "welcome" }]
  },

  lights: {
    source: "IFU",
    text: "What the sensor light means:\n• Green flash: puff recorded\n• Blue flashing: ready to pair\n• Amber: battery low, charge within 2 days\n• Red: sensor error",
    ask: "Which light are you seeing?",
    options: [
      { label: "Green", goto: "light_green" },
      { label: "Blue", goto: "light_blue" },
      { label: "Amber", goto: "light_amber" },
      { label: "Red", goto: "light_red" },
      { label: "No light", goto: "pair_no_light" }
    ]
  },
  light_green: {
    source: "IFU",
    text: "A green flash means your puff was recorded. Nothing else to do.",
    options: BACK
  },
  light_blue: {
    source: "IFU",
    text: "Flashing blue means the sensor is waiting to pair with your phone.",
    ask: "Do you want help pairing?",
    options: [{ label: "Yes", goto: "pair" }, { label: "No", goto: "welcome" }]
  },
  light_amber: {
    source: "IFU",
    text: "Amber means the battery is low. Charge it with the USB-C cable. A full charge takes about 2 hours and lasts around 3 months.\nYou can still use your inhaler while the sensor charges. Just log the puff by hand in the app.",
    options: BACK
  },
  light_red: {
    source: "IFU",
    text: "Red means a sensor error. Take the sensor off the inhaler and push it back on until you hear a click.",
    ask: "Is the light still red?",
    options: [{ label: "Yes", goto: "device_fault" }, { label: "No", goto: "light_fixed" }]
  },
  light_fixed: {
    source: "IFU",
    text: "Good, it's working again. If the red light keeps coming back, let support know.",
    options: BACK
  },

  not_recording: {
    source: "IFU",
    text: "The sensor stores up to 14 days of doses and sends them to the app when your phone is nearby with the app open.",
    ask: "Did the sensor flash green when you took the puff?",
    options: [{ label: "Yes", goto: "sync_issue" }, { label: "No", goto: "fit_check" }]
  },
  sync_issue: {
    source: "IFU",
    text: "Then the dose is saved on the sensor. Open the app with Bluetooth on, go to History and pull down to refresh. Doses can take a minute to appear.",
    options: BACK
  },
  fit_check: {
    source: "IFU",
    text: "The sensor may not be fitted properly. Take it off and push it back on until you hear a click.\nIf you've started a new inhaler, move the sensor across and tap New inhaler in the app.",
    ask: "Does it flash green on your next puff?",
    options: [{ label: "Yes", goto: "light_green" }, { label: "No", goto: "device_fault" }]
  },

  technique: {
    source: "TECH",
    text: "For a standard puffer (metered-dose inhaler):\n1. Take the cap off and shake.\n2. Breathe out gently, away from the inhaler.\n3. Seal your lips around the mouthpiece.\n4. Start breathing in slowly and press once.\n5. Keep breathing in slowly and deeply.\n6. Hold your breath for up to 10 seconds.\n7. Wait about 30 seconds before a second puff.",
    ask: "Do you use a spacer?",
    options: [{ label: "Yes", goto: "spacer" }, { label: "No", goto: "technique_feedback" }]
  },
  spacer: {
    source: "TECH",
    text: "With a spacer: put one puff into the spacer at a time, then take 5 slow breaths in and out through the mouthpiece.\nWash the spacer once a month in warm soapy water and let it air-dry. Don't rub it dry.",
    ask: "Would you like to know how the sensor checks your technique?",
    options: [{ label: "Yes", goto: "technique_feedback" }, { label: "No", goto: "welcome" }]
  },
  technique_feedback: {
    source: "IFU",
    text: "The sensor checks whether you shook the inhaler and how you timed the puff. In the app, open History and tap a puff:\n• Green tick: good technique\n• Amber: tips available\nYour nurse or pharmacist can also check your technique at your next review.",
    options: BACK
  },

  cleaning: {
    source: "IFU",
    text: "Take the sensor off before cleaning your inhaler. Wipe the sensor with a dry cloth. It's splash-resistant but not waterproof, so never put it in water.\nClean the inhaler as described in its leaflet.",
    ask: "Has the sensor got wet?",
    options: [{ label: "Yes", goto: "wet" }, { label: "No", goto: "welcome" }]
  },
  wet: {
    source: "IFU",
    text: "Dry it with a cloth and leave it off the inhaler for 24 hours before refitting. Don't charge it while it's wet.\nIf the light shows red afterwards, contact support.",
    options: BACK
  },

  new_inhaler: {
    source: "IFU",
    text: "The app estimates doses left from your recorded puffs, but the dose counter on your inhaler is the official count. Always check it.\nWhen you start a new inhaler, move the sensor across and tap New inhaler in the app.",
    ask: "Are you running low on medicine?",
    options: [{ label: "Yes", goto: "running_low" }, { label: "No", goto: "welcome" }]
  },
  running_low: {
    source: "PIL",
    text: "Order a repeat prescription from your GP surgery or pharmacy when you have about a week left. Don't let your preventer run out.\nYou can turn on a low-dose alert in Settings > Reminders.",
    options: BACK
  },

  reminders: {
    source: "IFU",
    text: "Set reminders in the app under Settings > Reminders. Match them to the times on your prescription label. The sensor can skip a reminder automatically if you've already taken your dose.",
    ask: "Have you missed a dose recently?",
    options: [{ label: "Yes", goto: "missed_dose" }, { label: "No", goto: "welcome" }]
  },
  missed_dose: {
    source: "PIL",
    text: "If you miss a preventer dose, take it when you remember, unless it's nearly time for your next one. Don't take a double dose to make up for it.\nIf you're not sure, check your inhaler leaflet or ask your pharmacist.",
    ask: "Would a daily reminder help?",
    options: [{ label: "Yes", goto: "reminders_how" }, { label: "No", goto: "welcome" }]
  },
  reminders_how: {
    source: "IFU",
    text: "Open the app, go to Settings > Reminders and tap Add reminder. Pick a time you're usually at home, like brushing your teeth.",
    options: BACK
  },

  privacy: {
    source: "PRIVACY",
    text: "Your dose data is encrypted and stored securely. It's only shared with your care team if you switch on sharing in Settings > Sharing.\nYou can download or delete your data at any time from Settings > My data.",
    options: BACK
  },
  travel: {
    source: "IFU",
    text: "You can use the sensor on flights. Keep your inhaler and sensor in your hand luggage.\nDoses are stored on the sensor for 14 days, so they'll sync when you next open the app, even if your phone was in flight mode.",
    options: BACK
  }
};
