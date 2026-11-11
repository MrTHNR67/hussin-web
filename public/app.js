const STORAGE_KEY = 'siyaj.solarGuardian.v1';
const DB_NAME = 'siyaj-local-media';
const DB_STORE = 'attachments';
const STEPS = [
  { title: 'Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¨ÙŠØ¦Ø© ÙˆØ§Ù„Ù…ÙˆÙ‚Ø¹', short: 'Ø§Ù„Ø¨ÙŠØ¦Ø© ÙˆØ§Ù„Ù…ÙˆÙ‚Ø¹', description: 'Ø£Ø®Ø¨Ø±Ù†Ø§ Ø¹Ù† Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ù†Ø¸Ø§Ù… ÙˆØ§Ù„Ø¸Ø±ÙˆÙ Ø§Ù„Ù…Ø­ÙŠØ·Ø© Ø¨Ø§Ù„Ø£Ù„ÙˆØ§Ø­.' },
  { title: 'Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø£Ù„ÙˆØ§Ø­', short: 'Ø§Ù„Ø£Ù„ÙˆØ§Ø­', description: 'Ø£Ø¶Ù Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø£Ù„ÙˆØ§Ø­ ÙˆØ£Ø±ÙÙ‚ ØµÙˆØ±Ø© Ø£Ùˆ Ù…Ù‚Ø·Ø¹Ø§Ù‹ Ù‚ØµÙŠØ±Ø§Ù‹ Ù„ÙØ­ØµÙ‡Ø§ Ø¨ØµØ±ÙŠØ§Ù‹.' },
  { title: 'ÙØ§ØªÙˆØ±Ø© Ø§Ù„ÙƒÙ‡Ø±Ø¨Ø§Ø¡', short: 'Ø§Ù„ÙØ§ØªÙˆØ±Ø©', description: 'ØªØ³Ø§Ø¹Ø¯Ù†Ø§ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ø¹Ù„Ù‰ ØªÙ‚Ø¯ÙŠØ± Ù‚ÙŠÙ…Ø© Ø§Ù„Ø·Ø§Ù‚Ø© Ø§Ù„ØªÙŠ Ù‚Ø¯ ØªÙÙ‚Ø¯Ù‡Ø§.' },
  { title: 'ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª', short: 'Ø§Ù„ØªØ£ÙƒÙŠØ¯', description: 'Ø±Ø§Ø¬Ø¹ Ù…Ù„Ø®Øµ Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ù‚Ø¨Ù„ Ø£Ù† ÙŠØ¨Ø¯Ø£ Ø³ÙŠØ§Ø¬ Ø¨ØªØ­Ù„ÙŠÙ„ Ù†Ø¸Ø§Ù…Ùƒ.' },
];
// Search aliases support familiar spellings; free text also accepts unlisted and legacy brands.
const PANEL_MANUFACTURERS = [
  ['Sheida Solar', ['Sheida', 'Ø´ÙŠØ¯Ø§', 'Ø´ÙŠØ¯Ø©']],
  ['Desert Technologies', ['DT', 'Ø¯ÙŠØ²Ø±Øª ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ²', 'ØªÙ‚Ù†ÙŠØ§Øª Ø§Ù„ØµØ­Ø±Ø§Ø¡']],
  ['Philadelphia Solar', ['Philadelphia', 'ÙÙŠÙ„Ø§Ø¯Ù„ÙÙŠØ§', 'ÙÙŠÙ„Ø§Ø¯Ù„ÙÙŠØ§ Ø³ÙˆÙ„Ø§Ø±']],
  ['DuSol', ['Dusol', 'Ø¯Ùˆ Ø³ÙˆÙ„', 'Ø¯ÙˆØ³ÙˆÙ„']],
  ['JinkoSolar', ['Jinko', 'Jinko Solar', 'Ø¬ÙŠÙ†ÙƒÙˆ', 'Ø¬Ù†ÙƒÙˆ']],
  ['JA Solar', ['JASolar', 'JA', 'Ø¬ÙŠ Ø§ÙŠ', 'Ø¬ÙŠ Ø¥ÙŠÙ‡', 'Ø¬Ø§ Ø³ÙˆÙ„Ø§Ø±']],
  ['LONGi Solar', ['LONGi', 'Ù„ÙˆÙ†Ø¬ÙŠ', 'Ù„ÙˆÙ†ØºÙŠ', 'Ù„ÙˆÙ†Ø¬Ù‰']],
  ['Trina Solar', ['Trina', 'Trinasolar', 'ØªØ±ÙŠÙ†Ø§']],
  ['Canadian Solar', ['Canadian', 'CSI Solar', 'ÙƒÙ†Ø¯ÙŠØ§Ù†', 'ÙƒØ§Ù†Ø§Ø¯ÙŠØ§Ù†', 'ÙƒÙ†Ø¯ÙŠ']],
  ['Qcells', ['Q Cells', 'Q-Cells', 'Hanwha', 'ÙƒÙŠÙˆ Ø³ÙŠÙ„Ø²', 'Ù‡Ø§Ù†ÙˆØ§']],
  ['REC', ['REC Group', 'Ø§Ø± Ø§ÙŠ Ø³ÙŠ', 'Ø¢Ø± Ø¥ÙŠ Ø³ÙŠ', 'Ø±ÙŠÙƒ']],
  ['Maxeon', ['Maxeon Solar', 'Ù…Ø§ÙƒØ³ÙŠÙˆÙ†', 'Ù…Ø§ÙƒØ³ÙˆÙ†']],
  ['SunPower', ['Sun Power', 'ØµÙ† Ø¨Ø§ÙˆØ±', 'Ø³Ø§Ù† Ø¨Ø§ÙˆØ±']],
  ['First Solar', ['First', 'ÙÙŠØ±Ø³Øª Ø³ÙˆÙ„Ø§Ø±', 'ÙÙŠØ±Ø³Øª']],
  ['Astronergy', ['CHINT', 'Chint Solar', 'Astro Energy', 'Ø£Ø³ØªØ±ÙˆÙ†Ø±Ø¬ÙŠ', 'Ø§Ø³ØªØ±ÙˆÙ†Ø±Ø¬ÙŠ', 'Ø´ÙŠÙ†Øª']],
  ['Risen Energy', ['Risen', 'Ø±ÙŠØ²Ù†', 'Ø±Ø§ÙŠØ²Ù†']],
  ['Tongwei Solar', ['TW Solar', 'Tongwei', 'ØªÙˆÙ†ØºÙˆÙŠ', 'ØªÙˆÙ†Ø¬ÙˆÙŠ', 'ØªÙŠ Ø¯Ø¨Ù„ÙŠÙˆ']],
  ['DMEGC Solar', ['DMEGC', 'Hengdian', 'Ø¯ÙŠ Ø§Ù… Ø§ÙŠ Ø¬ÙŠ Ø³ÙŠ', 'Ø¯ÙŠ Ø¥Ù… Ø¥ÙŠ Ø¬ÙŠ Ø³ÙŠ']],
  ['AIKO', ['Aiko Solar', 'Aiko Energy', 'Ø£ÙŠÙƒÙˆ', 'Ø§ÙŠÙƒÙˆ']],
  ['DAS Solar', ['DAS', 'Ø¯Ø§Ø³', 'Ø¯Ø§Ø³ Ø³ÙˆÙ„Ø§Ø±']],
  ['Huasun', ['Huasun Solar', 'Ù‡ÙˆØ§Ø³Ù†', 'Ù‡ÙˆØ§Ø³Ø§Ù†']],
  ['Seraphim', ['Seraphim Solar', 'Ø³ÙŠØ±Ø§ÙÙŠÙ…', 'Ø³Ø±Ø§ÙÙŠÙ…']],
  ['PHONO Solar', ['Phono', 'SUMEC', 'ÙÙˆÙ†Ùˆ', 'ÙÙˆÙ†Ùˆ Ø³ÙˆÙ„Ø§Ø±']],
  ['Talesun', ['Talesun Solar', 'ØªØ§ÙŠÙ„Ø³Ù†', 'ØªØ§Ù„ÙŠØ³Ù†']],
  ['Suntech', ['Suntech Power', 'Sun Tech', 'ØµÙ† ØªÙƒ', 'Ø³Ø§Ù†ØªÙƒ', 'Ø³Ù†ØªÙƒ']],
  ['Yingli Solar', ['Yingli', 'ÙŠÙ†Ø¬Ù„ÙŠ', 'ÙŠÙ†ØºÙ„ÙŠ']],
  ['GCL System Integration', ['GCL', 'GCL SI', 'GCL Solar', 'Ø¬ÙŠ Ø³ÙŠ Ø§Ù„', 'Ø¬ÙŠ Ø³ÙŠ Ø¥Ù„']],
  ['EGing PV', ['Eging', 'Ø§ÙŠØ¬ÙŠÙ†Ø¬', 'Ø¥ÙŠØ¬ÙŠÙ†Øº']],
  ['Jolywood', ['Jolywood Solar', 'Ø¬ÙˆÙ„ÙŠ ÙˆÙˆØ¯', 'Ø¬ÙˆÙ„ÙŠÙˆÙˆØ¯']],
  ['ZNShine Solar', ['Znshine', 'Ø²ÙŠÙ†Ø´Ø§ÙŠÙ†', 'Ø²Ø¯ Ø§Ù† Ø´Ø§ÙŠÙ†']],
  ['Sunova Solar', ['Sunova', 'ØµÙ†ÙˆÙØ§', 'Ø³Ø§Ù†ÙˆÙØ§']],
  ['URE', ['United Renewable Energy', 'ÙŠÙˆ Ø¢Ø± Ø¥ÙŠ', 'ÙŠÙˆ Ø§Ø± Ø§ÙŠ']],
  ['VSUN', ['VSUN Solar', 'Vietnam Sunergy', 'ÙÙŠ ØµÙ†', 'ÙÙŠ Ø³Ø§Ù†']],
  ['Sharp', ['Sharp Solar', 'Ø´Ø§Ø±Ø¨']],
  ['Waaree', ['Waaree Energies', 'ÙˆØ§Ø±ÙŠ', 'ÙˆØ§Ø±ÙŠÙŠ']],
  ['Vikram Solar', ['Vikram', 'ÙÙŠÙƒØ±Ø§Ù…']],
  ['Adani Solar', ['Adani', 'Ø£Ø¯Ø§Ù†ÙŠ', 'Ø§Ø¯Ø§Ù†ÙŠ']],
  ['Tata Power Solar', ['Tata', 'TP Solar', 'Tata Solar', 'ØªØ§ØªØ§', 'ØªØ§ØªØ§ Ø¨Ø§ÙˆØ±']],
  ['RenewSys', ['Renew Sys', 'Ø±ÙŠÙ†ÙŠÙˆ Ø³ÙŠØ³', 'Ø±ÙŠÙ†ÙŠÙˆØ³ÙŠØ³']],
  ['Goldi Solar', ['Goldi', 'Ø¬ÙˆÙ„Ø¯ÙŠ', 'ØºÙˆÙ„Ø¯ÙŠ']],
  ['Premier Energies', ['Premier', 'Ø¨Ø±ÙŠÙ…ÙŠØ±', 'Ø¨Ø±ÙŠÙ…ÙŠÙŠØ±']],
  ['Emmvee', ['Emmvee Solar', 'Ø¥Ù…ÙÙŠ', 'Ø§Ù…ÙÙŠ']],
  ['Saatvik', ['Saatvik Green Energy', 'Ø³Ø§ØªÙÙŠÙƒ']],
  ['Rayzon Solar', ['Rayzon', 'Ø±Ø§ÙŠØ²ÙˆÙ†', 'Ø±ÙŠØ²ÙˆÙ†']],
  ['AESOLAR', ['AE Solar', 'AE-Solar', 'Ø§ÙŠ Ø§ÙŠ Ø³ÙˆÙ„Ø§Ø±', 'Ø¥ÙŠÙ‡ Ø¥ÙŠ Ø³ÙˆÙ„Ø§Ø±']],
  ['Solarwatt', ['Solar Watt', 'Ø³ÙˆÙ„Ø§Ø± ÙˆØ§Øª', 'Ø³ÙˆÙ„Ø§Ø±ÙˆØ§Øª']],
  ['SoliTek', ['Ø³ÙˆÙ„ÙŠØªÙƒ', 'Ø³ÙˆÙ„ÙŠ ØªÙƒ']],
  ['Eurener', ['ÙŠÙˆØ±ÙŠÙ†Ø±', 'ÙŠÙˆØ±ÙŠÙ†ÙŠØ±']],
  ['Silfab Solar', ['Silfab', 'Ø³ÙŠÙ„ÙØ§Ø¨']],
  ['Mission Solar', ['Mission Solar Energy', 'Mission', 'Ù…ÙŠØ´Ù† Ø³ÙˆÙ„Ø§Ø±', 'Ù…ÙŠØ´Ù†']],
  ['SEG Solar', ['SEG', 'Ø§Ø³ Ø§ÙŠ Ø¬ÙŠ', 'Ø¥Ø³ Ø¥ÙŠ Ø¬ÙŠ']],
  ['Heliene', ['Ù‡ÙŠÙ„ÙŠÙŠÙ†', 'Ù‡ÙŠÙ„ÙŠØ§Ù†']],
  ['Qn-SOLAR', ['Qn Solar', 'ÙƒÙŠÙˆ Ø§Ù† Ø³ÙˆÙ„Ø§Ø±']],
  ['Osda', ['Osda Solar', 'Ø£ÙˆØ³Ø¯Ø§', 'Ø§ÙˆØ³Ø¯Ø§']],
  ['Bluesun Solar', ['Bluesun', 'Blue Sun', 'Ø¨Ù„Ùˆ ØµÙ†', 'Ø¨Ù„ÙˆØ³Ù†']],
  ['Luxen Solar', ['Luxen', 'Ù„ÙˆÙƒØ³Ù†', 'Ù„ÙˆÙƒØ³ÙŠÙ†']],
  ['CW Enerji', ['CW Energy', 'Ø³ÙŠ Ø¯Ø¨Ù„ÙŠÙˆ', 'Ø³ÙŠ Ø¯Ø¨Ù„ÙŠÙˆ Ø¥Ù†Ø±Ø¬ÙŠ']],
].sort(([a], [b]) => a.localeCompare(b, 'en'));
const TRANSLATIONS = {
  'Ø§Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„Ø´Ø±ÙƒØ© Ø§Ù„Ù…ØµÙ†Ù‘Ø¹Ø©': 'Search for a manufacturer',
  'Ø¹Ø±Ø¶ Ø§Ù„Ø´Ø±ÙƒØ§Øª Ø§Ù„Ù…ØµÙ†Ù‘Ø¹Ø©': 'Show manufacturers', 'Ø§Ù„Ø´Ø±ÙƒØ§Øª Ø§Ù„Ù…ØµÙ†Ù‘Ø¹Ø©': 'Manufacturers',
  'Ø§Ø¨Ø­Ø« Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ø£Ùˆ Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©ØŒ Ø£Ùˆ Ø§ÙƒØªØ¨ Ø§Ø³Ù… Ø§Ù„Ø´Ø±ÙƒØ©. ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ø®ØªÙŠØ§Ø± Â«ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙÂ».': 'Search in Arabic or English, or enter the company name. You can choose â€œUnknownâ€.',
  'ØªØ­Ù„ÙŠÙ„ Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Ai': 'Analyze bill with Ai',
  'Ø§Ù„ØºØ¨Ø§Ø± ÙÙŠ Ø§Ù„Ø¬Ùˆ': 'Airborne dust', 'Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù…ÙˆÙ‚Ø¹Ùƒ Ø§Ù„Ø­Ø§Ù„ÙŠ': 'Use your current location',
  'ØªÙ…Øª Ø§Ù„ØªØ¹Ø¨Ø¦Ø© Ù…Ù† Ø§Ù„Ø·Ù‚Ø³': 'Filled from weather data', 'Ø¬Ø§Ø±Ù ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…ÙˆÙ‚Ø¹â€¦': 'Getting locationâ€¦',
  'ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Claude': 'Panel assessment with Claude', 'ØªØ­Ù„ÙŠÙ„ Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Claude': 'Read bill with Claude',
  'Ø§Ù„Ø¸Ù„ ÙˆØ§Ù„ØºØ¨Ø§Ø± ÙˆØ§ØªØ¬Ø§Ù‡ Ø§Ù„Ø´Ù…Ø³': 'Shade, dust and sun direction', 'Ø®Ø³Ø§Ø±Ø© Ø§Ù„Ø·Ø§Ù‚Ø© ÙˆÙ‚ÙŠÙ…ØªÙ‡Ø§': 'Energy deficit and its value',
  'Ø­ÙØ¸ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª': 'Save details',
  'Ø¹Ù†Ø¯ Ø¶ØºØ· Ù‡Ø°Ø§ Ø§Ù„Ø²Ø±ØŒ ØªÙØ±Ø³Ù„ ØµÙˆØ± Ø§Ù„Ø£Ù„ÙˆØ§Ø­ ÙˆÙ„Ù‚Ø·Ø§Øª Ù…ÙˆØ²Ø¹Ø© Ù…Ù† Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ø¥Ù„Ù‰ AnthropicØŒ Ø­ØªÙ‰ 8 ØµÙˆØ± ÙÙŠ Ø§Ù„Ø·Ù„Ø¨. Ù„Ø§ ÙŠÙØ­Ù„Ù„ Ø§Ù„ØµÙˆØª Ø£Ùˆ ÙƒÙ„ Ø§Ù„Ø¥Ø·Ø§Ø±Ø§Øª.': 'Choosing this button sends panel photos and frames sampled across your video to Anthropic, up to 8 images per request. Audio and every frame are not assessed.',
  'Ø§ØªØ¬Ø§Ù‡ ÙˆØ§Ø¬Ù‡Ø© Ø§Ù„Ø£Ù„ÙˆØ§Ø­ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)': 'Panel facing direction (optional)', '0Â° Ø´Ù…Ø§Ù„ Â· 90Â° Ø´Ø±Ù‚ Â· 180Â° Ø¬Ù†ÙˆØ¨ Â· 270Â° ØºØ±Ø¨. Ø£Ø¯Ø®Ù„ Ù‚Ø±Ø§Ø¡Ø© Ø¨ÙˆØµÙ„Ø© Ù„Ù„ÙˆØ§Ø¬Ù‡Ø© Ø§Ù„ØªÙŠ ØªÙˆØ§Ø¬Ù‡ Ø§Ù„Ø´Ù…Ø³.': '0Â° north Â· 90Â° east Â· 180Â° south Â· 270Â° west. Enter a compass reading for the panel facing direction.',
  'ÙˆÙ‚Øª ØªØµÙˆÙŠØ± Ø§Ù„Ø£Ù„ÙˆØ§Ø­': 'Panel capture time', 'ÙˆÙ‚Øª Ù…Ø­Ù„ÙŠ ØªØ®ØªØ§Ø±Ù‡Ø› Ù„Ø§ Ù†Ø³ØªØ®Ø±Ø¬Ù‡ Ù…Ù† Ø§Ù„ÙÙŠØ¯ÙŠÙˆ. ÙŠÙ„Ø²Ù… Ø§Ù„Ù…ÙˆÙ‚Ø¹ ÙˆØ§Ù„Ù…ÙŠÙ„ ÙˆØ§Ù„Ø§ØªØ¬Ø§Ù‡ ÙˆØ§Ù„ÙˆÙ‚Øª Ù„Ø­Ø³Ø§Ø¨ Ø²Ø§ÙˆÙŠØ© Ø§Ù„Ø´Ù…Ø³.': 'Your selected local time; it is not extracted from video metadata. Location, tilt, direction and time are needed for sun geometry.',
  'ÙŠÙØ­Øµ Claude ØµÙˆØ±Ø§Ù‹ ÙˆÙ„Ù‚Ø·Ø§Øª Ù…Ø®ØªØ§Ø±Ø© Ù…Ù† Ø§Ù„Ù…Ù‚Ø§Ø·Ø¹ØŒ Ø­ØªÙ‰ 8 ØµÙˆØ± ÙÙŠ Ø§Ù„Ø·Ù„Ø¨. Ù„Ø§ ÙŠÙØ­Øµ Ø§Ù„ØµÙˆØª Ø£Ùˆ ÙƒÙ„ Ø¥Ø·Ø§Ø±Ø§Øª Ø§Ù„ÙÙŠØ¯ÙŠÙˆ.': 'Claude inspects photos and selected frames from your clips, up to 8 images per request. Audio and every video frame are not analyzed.',
  'Ù„Ø§ ÙŠÙ…ÙƒÙ† Ù‚ÙŠØ§Ø³ Ø­Ø±Ø§Ø±Ø© Ø§Ù„Ø³Ø·Ø­ Ø£Ùˆ Ø²Ø§ÙˆÙŠØ© Ø§Ù„Ù…ÙŠÙ„ Ø§Ù„Ø¯Ù‚ÙŠÙ‚Ø© Ù…Ù† ØµÙˆØ±Ø© Ø¹Ø§Ø¯ÙŠØ©Ø› ÙŠØ¹ØªÙ…Ø¯ Ø§Ù„Ø­Ø³Ø§Ø¨ Ø¹Ù„Ù‰ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ØªÙŠ ØªØ¯Ø®Ù„Ù‡Ø§ ÙˆØ§Ù„Ø·Ù‚Ø³.': 'An ordinary image cannot measure surface temperature or exact panel tilt; calculations use your inputs and weather.',
  'ØªÙØ±Ø³Ù„ Ø§Ù„ØµÙˆØ± ÙˆØ§Ù„Ù„Ù‚Ø·Ø§Øª Ø¥Ù„Ù‰ Anthropic ÙÙ‚Ø· Ø¹Ù†Ø¯ Ø¶ØºØ· Â«ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… ClaudeÂ».': 'Images and frames are sent to Anthropic only when you choose â€œPanel assessment with Claudeâ€.',
  'Ø¥Ù†ØªØ§Ø¬ Ù…ØªÙˆÙ‚Ø¹ Ù„Ù„Ø´Ù‡Ø± (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)': 'Expected monthly generation (optional)', 'Ø¥Ù†ØªØ§Ø¬ ÙØ¹Ù„ÙŠ Ù„Ù„Ø´Ù‡Ø± (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)': 'Actual monthly generation (optional)',
  'Ø§Ø³ØªØ®Ø¯Ù… Ø®Ø· Ø£Ø³Ø§Ø³ Ù…ÙˆØ«ÙˆÙ‚Ø§Ù‹ Ù„Ù„Ù†Ø¸Ø§Ù…. ÙŠØ¬Ø¨ Ø£Ù† ÙŠØºØ·ÙŠ Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ø§Ù„Ù…ØªÙˆÙ‚Ø¹ ÙˆØ§Ù„ÙØ¹Ù„ÙŠ Ø§Ù„ÙØªØ±Ø© Ù†ÙØ³Ù‡Ø§.': 'Use a reliable baseline for your system. Expected and actual generation must cover the same period.',
  'Ù‚Ø±Ø§Ø¡Ø© Ø¹Ø¯Ù‘Ø§Ø¯ Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ø£Ùˆ Ø§Ù„Ø¹Ø§ÙƒØ³Ø› Ø§Ø³ØªÙ‡Ù„Ø§Ùƒ Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ù„ÙŠØ³ Ø¥Ù†ØªØ§Ø¬ Ø§Ù„Ø£Ù„ÙˆØ§Ø­.': 'A generation meter or inverter reading; bill consumption is not panel generation.',
  'Ù‚Ø¯ ØªØªØ¶Ù…Ù† Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ø¨ÙŠØ§Ù†Ø§Øª Ø´Ø®ØµÙŠØ©Ø› Ø§Ø­Ø¬Ø¨ Ù…Ø§ Ù„Ø§ ÙŠÙ„Ø²Ù…. Ù„Ù† ØªÙØ±Ø³Ù„ Ø¥Ù„Ù‰ Anthropic Ø¥Ù„Ø§ Ø¹Ù†Ø¯ Ø¶ØºØ· Ø²Ø± ØªØ­Ù„ÙŠÙ„ Ø§Ù„ÙØ§ØªÙˆØ±Ø©.': 'Bills may contain personal details; cover anything unnecessary. The bill is sent to Anthropic only when you press the bill analysis button.',
  'Ø±Ø§Ø¬Ø¹ Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ÙØ§ØªÙˆØ±Ø©': 'Review extracted bill details', 'Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©': 'Apply reviewed details', 'Ø¥Ù„ØºØ§Ø¡': 'Cancel',
  'Ø§Ø³ØªÙ‡Ù„Ø§Ùƒ Ø§Ù„Ø·Ø§Ù‚Ø©': 'Energy consumption', 'Ø§Ù„Ø¹Ù…Ù„Ø©': 'Currency', 'Ø§Ù„ØªØ¹Ø±ÙØ© Ù„ÙƒÙ„ kWh': 'Rate per kWh', 'Ø£ÙŠØ§Ù… Ø§Ù„ÙØ§ØªÙˆØ±Ø©': 'Billing days',
  'Ù‡Ø°Ù‡ Ù‚Ø±Ø§Ø¡Ø© Ø¢Ù„ÙŠØ© Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„Ø®Ø·Ø£. Ø±Ø§Ø¬Ø¹ Ø§Ù„Ø£Ø±Ù‚Ø§Ù… ÙˆØ§Ù„Ø¹Ù…Ù„Ø© ÙˆØ§Ù„Ø´Ù‡Ø± Ù‚Ø¨Ù„ Ø§Ø³ØªØ®Ø¯Ø§Ù…Ù‡Ø§. Ø§Ù„ÙØ§ØªÙˆØ±Ø© ÙˆØ­Ø¯Ù‡Ø§ Ù„Ø§ ØªØ«Ø¨Øª Ø®Ø³Ø§Ø±Ø© Ø§Ù„Ø£Ù„ÙˆØ§Ø­.': 'Automatic extraction can be wrong. Review numbers, currency and month before applying them. A bill alone cannot establish solar losses.',
  'Ø§Ù„Ø®Ø³Ø§Ø±Ø© ÙÙŠ Ø§Ù„Ø´Ù‡Ø± Ø§Ù„Ù…Ø­Ø¯Ø¯': 'Loss for selected month', 'Ø§Ù„Ø´Ù‡Ø±': 'Month', 'ØªØ­Ø¯ÙŠØ« ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø´Ù‡Ø±': 'Update monthly assessment',
  'Claude ØºÙŠØ± Ù…ÙØ¹Ù‘Ù„ Ø¨Ø¹Ø¯. ÙŠØ³ØªØ·ÙŠØ¹ Ù…Ø³Ø¤ÙˆÙ„ Ø§Ù„Ù…ÙˆÙ‚Ø¹ ØªÙØ¹ÙŠÙ„Ù‡ Ø¨Ù…ÙØªØ§Ø­ Anthropic.': 'Claude is not enabled yet. The site administrator can enable it with an Anthropic key.',
  'ØªØ¹Ø°Ø± Ù…Ø¹Ø±ÙØ© Ø­Ø§Ù„Ø© ClaudeØ› Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.': 'Could not check Claude availability; try again.',
  'Ø¬Ø§Ø±Ù Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ÙØ§ØªÙˆØ±Ø©â€¦': 'Reading billâ€¦', 'ØªØ¹Ø°Ø± Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ÙØ§ØªÙˆØ±Ø©. Ø¬Ø±Ù‘Ø¨ ØµÙˆØ±Ø© Ø£ÙˆØ¶Ø­.': 'Could not read the bill. Try a clearer image.',
  'ØªÙ… Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ø§Ù„ØªÙŠ Ø±Ø§Ø¬Ø¹ØªÙ‡Ø§.': 'Your reviewed bill details were applied.', 'ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ù„Ø´Ù‡Ø± ÙˆØ§Ù„Ø£Ø±Ù‚Ø§Ù… Ù‚Ø¨Ù„ Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ÙØ§ØªÙˆØ±Ø©.': 'Check the month and numbers before applying bill details.',
  'Ø­Ø³Ø§Ø¨ Ø§Ù„Ù‚ÙŠÙ…Ø© Ù‡Ù†Ø§ ÙŠØ¯Ø¹Ù… Ø§Ù„Ø±ÙŠØ§Ù„ Ø§Ù„Ø¹ÙÙ…Ø§Ù†ÙŠØ› Ø£Ø¯Ø®Ù„ ØªØ¹Ø±ÙØ© Ø¨Ø§Ù„Ø±ÙŠØ§Ù„ Ø§Ù„Ø¹ÙÙ…Ø§Ù†ÙŠ ÙŠØ¯ÙˆÙŠØ§Ù‹ Ù„Ù‡Ø°Ù‡ Ø§Ù„ÙØ§ØªÙˆØ±Ø©.': 'The value calculation supports Omani rials; enter an OMR rate manually for this bill.',
  'ØªØ£ÙƒØ¯ Ù…Ù† Ø§ØªØ¬Ø§Ù‡ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø¨ÙŠÙ† 0 Ùˆ360 Ø¯Ø±Ø¬Ø©.': 'Panel direction must be between 0 and 360 degrees.', 'ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ù„Ù…ÙŠÙ„ Ø¨ÙŠÙ† 0 Ùˆ90 Ø¯Ø±Ø¬Ø©.': 'Panel tilt must be between 0 and 90 degrees.',
  'ØªØ£ÙƒØ¯ Ù…Ù† ÙˆÙ‚Øª Ø§Ù„ØªØµÙˆÙŠØ±.': 'Check the capture time.', 'ØªØ£ÙƒØ¯ Ù…Ù† Ù‚ÙŠÙ…Ø© Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ø§Ù„Ù…ØªÙˆÙ‚Ù‘Ø¹ ÙˆØ§Ù„ÙØ¹Ù„ÙŠ.': 'Check expected and actual generation.',
  'ØªØ¹Ø°Ø± ÙØªØ­ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„Ù…ØªØµÙØ­Ø› Ø¬Ø±Ù‘Ø¨ MP4 Ø£Ùˆ Ø£Ø±ÙÙ‚ ØµÙˆØ±Ø§Ù‹ Ù…Ù† Ø§Ù„Ù…Ù‚Ø·Ø¹.': 'This browser could not open the video; try MP4 or attach still images from the clip.',
  'Ù„Ø§ ØªÙˆØ¬Ø¯ Ù„Ù‚Ø·Ø§Øª Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„ØªØ­Ù„ÙŠÙ„Ø› Ø£Ø±ÙÙ‚ ØµÙˆØ±Ø© ÙˆØ§Ø¶Ø­Ø© Ø£Ùˆ ÙÙŠØ¯ÙŠÙˆ Ù…Ø¯Ø¹ÙˆÙ…Ø§Ù‹.': 'No readable frames were available; attach a clear image or supported video.',
  'ØªØºÙŠØ±Øª Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„ØªØ­Ù„ÙŠÙ„. Ø£Ø¹Ø¯ Ø§Ù„Ø·Ù„Ø¨ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ø§Ù„ÙŠØ©.': 'Details changed during analysis. Submit again with the current details.',
  'ØªØ¹Ø°Ø± Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø­Ø¯ Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø¢Ù†. Ø£Ø¹Ø¯ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù„Ø§Ø­Ù‚Ø§Ù‹.': 'Could not check the analysis usage limit. Try again later.',
  'Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø°ÙƒÙŠ Ù…ØªÙˆÙ‚Ù Ø­Ø§Ù„ÙŠØ§Ù‹ ÙˆÙÙ‚ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù….': 'AI analysis is currently disabled by the usage settings.',
  'ÙŠÙˆØ¬Ø¯ ØªØ­Ù„ÙŠÙ„ Ù„Ø­Ø³Ø§Ø¨Ùƒ Ù‚ÙŠØ¯ Ø§Ù„ØªÙ†ÙÙŠØ°. Ø§Ù†ØªØ¸Ø± Ø§ÙƒØªÙ…Ø§Ù„Ù‡.': 'An assessment for your account is already running. Wait for it to finish.',
  'Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ù…Ø´ØºÙˆÙ„ Ø­Ø§Ù„ÙŠØ§Ù‹. Ø£Ø¹Ø¯ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ø¨Ø¹Ø¯ Ù‚Ù„ÙŠÙ„.': 'The analysis service is busy. Try again shortly.',
  'ÙˆØµÙ„Øª Ø¥Ù„Ù‰ Ø­Ø¯ Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø§Ù„ÙŠÙˆÙ…ÙŠ Ù„Ø­Ø³Ø§Ø¨Ùƒ. ÙŠØªØ¬Ø¯Ø¯ Ø§Ù„Ø­Ø¯ Ø¹Ù†Ø¯ Ù…Ù†ØªØµÙ Ø§Ù„Ù„ÙŠÙ„ Ø¨ØªÙˆÙ‚ÙŠØª UTC.': 'Your account has reached its daily analysis limit. The limit resets at midnight UTC.',
  'ÙˆØµÙ„ Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø¥Ù„Ù‰ Ø­Ø¯ Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø§Ù„ÙŠÙˆÙ…ÙŠ. ÙŠØªØ¬Ø¯Ø¯ Ø§Ù„Ø­Ø¯ Ø¹Ù†Ø¯ Ù…Ù†ØªØµÙ Ø§Ù„Ù„ÙŠÙ„ Ø¨ØªÙˆÙ‚ÙŠØª UTC.': 'The site has reached its daily analysis limit. The limit resets at midnight UTC.',
  'Ø§Ù†ØªØ¸Ø± 30 Ø«Ø§Ù†ÙŠØ© Ø¨ÙŠÙ† Ø·Ù„Ø¨Ø§Øª Ø§Ù„ØªØ­Ù„ÙŠÙ„.': 'Wait 30 seconds between analysis requests.',
  'Ø§Ù†ØªÙ‡Øª Ø¬Ù„Ø³Ø© Ø§Ù„Ø¯Ø®ÙˆÙ„Ø› Ø³Ø¬Ù‘Ù„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù…Ù† Ø¬Ø¯ÙŠØ¯.': 'Your session has expired. Log in again.',
  'Ø£Ø¶Ù GOOGLE_CLIENT_ID Ø¥Ù„Ù‰ Ù…Ù„Ù .env Ù„ØªÙØ¹ÙŠÙ„ ØªØ³Ø¬ÙŠÙ„ Google.': 'Add GOOGLE_CLIENT_ID to the .env file to enable Google sign-in.',
  'Ø£Ø±ÙÙ‚ ØµÙˆØ±Ø© Ø£Ùˆ ÙÙŠØ¯ÙŠÙˆ Ù„Ù„Ø£Ù„ÙˆØ§Ø­ Ù‚Ø¨Ù„ Ø§Ù„ØªØ­Ù„ÙŠÙ„.': 'Attach a panel photo or video before analysis.',
  'ØªØ¹Ø°Ø± Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ØµÙˆØ± Ø§Ù„Ù…Ø±ÙÙ‚Ø©. Ø¬Ø±Ù‘Ø¨ ØµÙˆØ± JPEG Ø£Ùˆ PNG Ø£Ùˆ WEBP.': 'Could not read the attached images. Try JPEG, PNG, or WEBP images.',
  'Ø±ÙÙŠÙ‚Ùƒ Ø§Ù„Ø°ÙƒÙŠ Ù„Ù„Ø·Ø§Ù‚Ø© Ø§Ù„Ø´Ù…Ø³ÙŠØ©': 'Your smart solar companion', 'Ù†Ø­Ù…ÙŠ Ø¥Ù†ØªØ§Ø¬ÙƒØŒ Ø®Ø·ÙˆØ© Ø¨Ø®Ø·ÙˆØ©': 'Protecting your solar output, step by step',
  'Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©': 'Home', 'Ø§Ù„Ø³Ø¬Ù„': 'History', 'Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª': 'Settings', 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„': 'Log in', 'Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨': 'Create account',
  'Ø­Ø¯Ù‘Ø¯ Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ù†Ø¸Ø§Ù…': 'Set system location', 'Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„Ø±Ø¦ÙŠØ³ÙŠØ©': 'Back to home', 'Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©': 'Menu',
  'ØµØ¨Ø§Ø­ Ø§Ù„Ø·Ø§Ù‚Ø©ØŒ ': 'Hello, ', 'ÙŠØ§ ØµØ¯ÙŠÙ‚ Ø§Ù„Ø´Ù…Ø³': 'sunshine', 'Ù‡Ø°Ù‡ Ù„Ù…Ø­Ø© Ø³Ø±ÙŠØ¹Ø© Ø¹Ù† Ø£Ø¯Ø§Ø¡ Ù†Ø¸Ø§Ù…Ùƒ Ø§Ù„ÙŠÙˆÙ….': 'Here is a quick look at your system today.',
  'ØªØ­Ø¯ÙŠØ« Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù…': 'Update system details', 'Ø­Ø§Ù„Ø© Ø§Ù„ÙŠÙˆÙ…': 'Todayâ€™s status', 'Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø¨ÙŠØ§Ù†Ø§Øª Ù†Ø¸Ø§Ù…Ùƒ': 'Waiting for your system details',
  'Ø§Ø¨Ø¯Ø£ Ø§Ù„ØªØ­Ù„ÙŠÙ„': 'Start analysis', 'ÙÙ‚Ø¯ ØªÙ‚Ø¯ÙŠØ±ÙŠ': 'Estimated loss', 'Ù†Ø­ØªØ§Ø¬ Ø¨Ø¹Ø¶ Ø§Ù„ØªÙØ§ØµÙŠÙ„ Ø£ÙˆÙ„Ø§Ù‹': 'A few details are needed first',
  'Ø£Ø¯Ø®Ù„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù… ÙˆØ£Ø±ÙÙ‚ ØµÙˆØ±Ø© Ø£Ùˆ Ù…Ù‚Ø·Ø¹Ø§Ù‹ Ù„Ù„Ø£Ù„ÙˆØ§Ø­ Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ù‚Ø±Ø§Ø¡Ø© Ø£ÙˆØ¶Ø­.': 'Enter your system details and add a panel photo or video for a clearer estimate.',
  'Ø¥Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ù†Ø¸Ø§Ù…': 'Set up system', 'Ø§Ù„Ø·Ù‚Ø³ â€”': 'Weather â€”', 'Ø§Ù„Ø·Ù‚Ø³ ØºÙŠØ± Ù…ØªØ§Ø­': 'Weather unavailable',
  'Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ« ': 'Last updated ', 'Ù…Ù„Ø®Øµ Ø§Ù„Ù†Ø¸Ø§Ù…': 'System overview', 'Ù†Ø¸Ø±Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù„ÙˆØ§Ø­': 'Panel overview',
  'Ø¯Ø±Ø¬Ø© Ø§Ù„Ø­Ø±Ø§Ø±Ø©': 'Temperature', 'Ø­Ø±Ø§Ø±Ø© Ø§Ù„Ø¬Ùˆ Ø§Ù„Ø­Ø§Ù„ÙŠØ©': 'Current air temperature', 'Ø§Ù„Ø±Ø·ÙˆØ¨Ø©': 'Humidity', 'Ø§Ù„Ø±Ø·ÙˆØ¨Ø© Ø§Ù„Ù†Ø³Ø¨ÙŠØ©': 'Relative humidity',
  'Ù…Ø³ØªÙˆÙ‰ Ø§Ù„ØºØ¨Ø§Ø±': 'Dust level', 'ØªÙ‚Ø¯ÙŠØ± Ø£ÙˆÙ„ÙŠ': 'Initial estimate', 'ØªÙ‚Ø¯ÙŠØ± Ø§Ù„ØºØ¨Ø§Ø± Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù„ÙˆØ§Ø­': 'Estimated panel dust',
  'ØªÙ‚Ø¯ÙŠØ±Ùƒ Ø§Ù„ÙŠØ¯ÙˆÙŠ Ù„Ù„Ø£Ù„ÙˆØ§Ø­': 'Your panel estimate', 'Ù…Ø¤Ø´Ø± Ø¬ÙˆÙŠ': 'air indicator', 'Ø§Ù„Ø®Ø³Ø§Ø±Ø© Ø§Ù„ÙŠÙˆÙ…ÙŠØ©': 'Daily energy loss',
  'Ø·Ø§Ù‚Ø© ØªÙ‚Ø¯ÙŠØ±ÙŠØ©': 'Estimated energy', 'ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø·Ù‚Ø³ ÙˆØ§Ù„Ù…ÙˆÙ‚Ø¹': 'Refresh weather and location', 'ØªÙˆØµÙŠØ© Ø³ÙŠØ§Ø¬': 'Siyaj recommendation',
  'Ø§Ø¨Ø¯Ø£ Ø¨ÙØ­Øµ Ø£Ù„ÙˆØ§Ø­Ùƒ': 'Start with a panel check', 'Ù‚Ø¯ ÙŠÙƒÙˆÙ† ØªÙ†Ø¸ÙŠÙ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ù…ÙÙŠØ¯Ø§Ù‹': 'Panel cleaning may help',
  'Ø±Ø§Ù‚Ø¨ Ø£Ø«Ø± Ø§Ù„Ø­Ø±Ø§Ø±Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù„ÙˆØ§Ø­': 'Keep an eye on heat impact', 'Ø­Ø§ÙØ¸ Ø¹Ù„Ù‰ Ù…ØªØ§Ø¨Ø¹Ø© Ø¯ÙˆØ±ÙŠØ©': 'Keep checking your system regularly',
  'ØªÙ… Ø§Ù„ØªÙ†Ø¸ÙŠÙ': 'Cleaned', 'Ù…ØªØ§Ø¨Ø¹Ø© Ø§Ù„Ø£Ø¯Ø§Ø¡': 'Performance', 'Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹': 'Weekly outlook', 'Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ø§Ù„Ù…ØªÙˆÙ‚Ø¹': 'Estimated output',
  'Ø¢Ø®Ø± 7 Ø£ÙŠØ§Ù…': 'Last 7 days', 'Ø§Ù„Ø£ÙŠØ§Ù… Ø§Ù„Ø³Ø¨Ø¹Ø© Ø§Ù„Ù‚Ø§Ø¯Ù…Ø©': 'Next 7 days', 'Ù…Ø®Ø·Ø· Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ø§Ù„Ù…ØªÙˆÙ‚Ø¹ Ø®Ù„Ø§Ù„ Ø§Ù„Ø£ÙŠØ§Ù… Ø§Ù„Ø³Ø¨Ø¹Ø© Ø§Ù„Ù‚Ø§Ø¯Ù…Ø©': 'Expected solar output for the next seven days', 'ØªÙ‚Ø¯ÙŠØ±Ø§Øª Ø£ÙˆÙ„ÙŠØ© ØªØªØ­Ø¯Ø« Ù…Ø¹ Ø§Ù„Ø·Ù‚Ø³': 'Initial estimates update with the weather',
  'Ø¨ÙŠØ§Ù†Ø§Øª Ù…Ø®ØªØµØ±Ø©': 'System details', 'Ù„Ù… ØªØªÙ… Ø¥Ø¶Ø§ÙØ© Ø¨ÙŠØ§Ù†Ø§Øª Ø¨Ø¹Ø¯.': 'No system details added yet.',
  'Ù…ÙŠÙ„ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ ÙˆØ§Ù„ØºØ¨Ø§Ø±': 'Panel tilt and dust', 'Ø²Ø§ÙˆÙŠØ© Ø§Ù„Ù„ÙˆØ­ ÙˆØªØ±Ø§ÙƒÙ… Ø§Ù„ØºØ¨Ø§Ø±': 'Tilt angle and dust build-up',
  'ÙŠØªØºÙŠÙ‘Ø± Ø§Ù„Ù…Ø´Ù‡Ø¯ Ø­Ø³Ø¨ Ù…ÙŠÙ„ Ø§Ù„Ù„ÙˆØ­ Ø§Ù„Ù…Ø¯Ø®Ù„ ÙÙŠ ØµÙØ­Ø© Ø§Ù„ØªØ³Ø¬ÙŠÙ„ØŒ ÙˆØ£Ø¯Ù†Ù‰ Ù…ÙŠÙ„ ÙŠØ¹Ù†ÙŠ ØºØ¨Ø§Ø±Ø§Ù‹ Ø£ÙƒØ«Ø±.': 'The scene follows the tilt entered on the setup page: the lower the tilt, the more dust collects.',
  'Ø§Ù„Ù‚Ø¯Ø±Ø©': 'Capacity', 'Ø§Ù„Ø£Ù„ÙˆØ§Ø­': 'Panels', 'Ø§Ù„Ù…ÙˆÙ‚Ø¹': 'Location', 'Ø§Ù„Ù…ÙŠÙ„': 'Tilt', 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯': 'Not set',
  'Ø§Ù„Ù†ØªØ§Ø¦Ø¬ Ø§Ù„ØªÙ‚Ø¯ÙŠØ±ÙŠØ© Ù„Ø§ ØªØ³ØªØ¨Ø¯Ù„ ÙØ­Øµ ÙÙ†ÙŠ Ù…Ø®ØªØµ.': 'Estimates do not replace an inspection by a qualified technician.',
  'Ø®Ø·ÙˆØ© Ø¨Ø³ÙŠØ·Ø© Ù†Ø­Ùˆ Ø·Ø§Ù‚Ø© Ø£ÙØ¶Ù„': 'A few steps toward better solar performance', 'Ù„Ù†ØªØ¹Ø±Ù‘Ù Ø¹Ù„Ù‰ Ù†Ø¸Ø§Ù…Ùƒ ': 'Letâ€™s get to know your system ',
  'Ø£Ø¬Ø¨ Ø¹Ù† Ù‡Ø°Ù‡ Ø§Ù„Ø®Ø·ÙˆØ§Øª Ù„ØªØ­ØµÙ„ Ø³ÙŠØ§Ø¬ Ø¹Ù„Ù‰ ØµÙˆØ±Ø© Ù…ØªÙƒØ§Ù…Ù„Ø© Ø¹Ù† Ø£Ù„ÙˆØ§Ø­Ùƒ.': 'Answer these questions to help Siyaj understand your panels.',
  'Ø§Ù„Ø¨ÙŠØ¦Ø© ÙˆØ§Ù„Ù…ÙˆÙ‚Ø¹': 'Environment & location', 'Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¨ÙŠØ¦Ø© ÙˆØ§Ù„Ù…ÙˆÙ‚Ø¹': 'Environment and location',
  'Ø§Ù„Ø£Ù„ÙˆØ§Ø­': 'Panels', 'Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø£Ù„ÙˆØ§Ø­': 'Panel details', 'Ø§Ù„ÙØ§ØªÙˆØ±Ø©': 'Electricity bill', 'ÙØ§ØªÙˆØ±Ø© Ø§Ù„ÙƒÙ‡Ø±Ø¨Ø§Ø¡': 'Electricity bill',
  'Ø§Ù„ØªØ£ÙƒÙŠØ¯': 'Review', 'ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª': 'Review details', 'Ø¨ÙŠØ§Ù†Ø§ØªÙƒ ØªØ­ÙØ¸ Ø¹Ù„Ù‰ Ø­Ø³Ø§Ø¨Ùƒ ÙˆØªØ¸Ù‡Ø± Ø¹Ù†Ø¯ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù…Ù† Ø£Ø¬Ù‡Ø²ØªÙƒ.': 'Your details are saved to your account and appear when you sign in on your devices.',
  'Ø­ÙØ¸ ØªÙ„Ù‚Ø§Ø¦ÙŠ': 'Saved automatically', 'Ø§Ù„ØªØ§Ù„ÙŠ ': 'Next ', 'Ø§Ù„Ø³Ø§Ø¨Ù‚': 'Back', 'ØªØ³ØªØºØ±Ù‚ Ø£Ù‚Ù„ Ù…Ù† Ø¯Ù‚ÙŠÙ‚ØªÙŠÙ†': 'Takes less than two minutes',
  'ØªÙ‚Ø¯ÙŠØ±Ø§Øª Ø³ÙŠØ§Ø¬ Ø¥Ø±Ø´Ø§Ø¯ÙŠØ©': 'Siyaj estimates are guidance only', 'Ø§Ø¨Ø¯Ø£ Ø§Ù„ØªØ­Ù„ÙŠÙ„ ': 'Analyze system ',
  'Ø£Ø®Ø¨Ø±Ù†Ø§ Ø¹Ù† Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ù†Ø¸Ø§Ù… ÙˆØ§Ù„Ø¸Ø±ÙˆÙ Ø§Ù„Ù…Ø­ÙŠØ·Ø© Ø¨Ø§Ù„Ø£Ù„ÙˆØ§Ø­.': 'Tell us where your system is and about the conditions around the panels.',
  'Ø£Ø¶Ù Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø£Ù„ÙˆØ§Ø­ ÙˆØ£Ø±ÙÙ‚ ØµÙˆØ±Ø© Ø£Ùˆ Ù…Ù‚Ø·Ø¹Ø§Ù‹ Ù‚ØµÙŠØ±Ø§Ù‹ Ù„ÙØ­ØµÙ‡Ø§ Ø¨ØµØ±ÙŠØ§Ù‹.': 'Add panel details and attach a photo or short video for visual inspection.',
  'ØªØ³Ø§Ø¹Ø¯Ù†Ø§ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ø¹Ù„Ù‰ ØªÙ‚Ø¯ÙŠØ± Ù‚ÙŠÙ…Ø© Ø§Ù„Ø·Ø§Ù‚Ø© Ø§Ù„ØªÙŠ Ù‚Ø¯ ØªÙÙ‚Ø¯Ù‡Ø§.': 'Bill details help estimate the value of energy you may be losing.',
  'Ø±Ø§Ø¬Ø¹ Ù…Ù„Ø®Øµ Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ù‚Ø¨Ù„ Ø£Ù† ÙŠØ¨Ø¯Ø£ Ø³ÙŠØ§Ø¬ Ø¨ØªØ­Ù„ÙŠÙ„ Ù†Ø¸Ø§Ù…Ùƒ.': 'Review the details before Siyaj analyzes your system.',
  'Ø§Ø³Ù…Ùƒ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)': 'Your name (optional)', 'Ø¯Ø±Ø¬Ø© Ø­Ø±Ø§Ø±Ø© Ø§Ù„Ø¬Ùˆ': 'Air temperature', 'Ø§Ù„Ø±Ø·ÙˆØ¨Ø© Ø§Ù„Ù†Ø³Ø¨ÙŠØ©': 'Relative humidity', 'Ø¹Ø¯Ø¯ Ø§Ù„Ø£Ù„ÙˆØ§Ø­': 'Number of panels',
  'ØªØ±Ø§ÙƒÙ… Ø§Ù„ØºØ¨Ø§Ø± Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù„ÙˆØ§Ø­': 'Dust on the panels', 'ØªÙ‚Ø¯ÙŠØ± Ù…Ø¨Ø¯Ø¦ÙŠØ› Ø¹Ø¯Ù‘Ù„Ù‡ Ø­Ø³Ø¨ Ù…Ø§ ØªØ±Ø§Ù‡ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù„ÙˆØ§Ø­.': 'An initial estimate; adjust it to match what you see on the panels.',
  'Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ù†Ø¸Ø§Ù…': 'System location', 'Ø§Ø¨Ø­Ø« Ø¹Ù† Ù…Ø¯ÙŠÙ†Ø© Ø£Ùˆ Ù…Ø­Ø§ÙØ¸Ø©': 'Search for a city or region', 'Ø¨Ø­Ø«': 'Search',
  'Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ø¯Ù‚ÙŠÙ‚ Ø§Ø®ØªÙŠØ§Ø±ÙŠØ› Ø§Ø³ØªØ®Ø¯Ù… GPS Ù„Ø¬Ù„Ø¨ Ø§Ù„Ø·Ù‚Ø³ Ø§Ù„Ø£Ù‚Ø±Ø¨.': 'Exact location is optional. Use GPS for nearby weather.',
  'Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù…ÙˆÙ‚Ø¹ÙŠ Ø§Ù„Ø­Ø§Ù„ÙŠ': 'Use my current location', 'Ø§Ù„Ù‚Ø¯Ø±Ø© Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠØ© Ù„Ù„Ù†Ø¸Ø§Ù…': 'Total system capacity', 'Ø§Ù„Ø´Ø±ÙƒØ© Ø§Ù„Ù…ØµÙ†Ù‘Ø¹Ø©': 'Manufacturer',
  'Ø£Ùˆ Ø§ÙƒØªØ¨: ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ': 'Or enter: unknown', 'Ù…ÙŠÙ„ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø¹Ù† Ø§Ù„Ø£ÙÙ‚ÙŠ': 'Panel tilt from horizontal', 'Ù†ÙˆØ¹ Ø§Ù„Ø£Ù„ÙˆØ§Ø­': 'Panel type',
  'Ø£Ø­Ø§Ø¯ÙŠØ© Ø§Ù„Ø¨Ù„ÙˆØ±Ø©': 'Monocrystalline', 'Ù…ØªØ¹Ø¯Ø¯Ø© Ø§Ù„Ø¨Ù„ÙˆØ±Ø§Øª': 'Polycrystalline', 'Ø£ØºØ´ÙŠØ© Ø±Ù‚ÙŠÙ‚Ø©': 'Thin film', 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ': 'Unknown',
  'ÙƒÙØ§Ø¡Ø© Ø§Ù„Ù„ÙˆØ­ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)': 'Panel efficiency (optional)', 'Ù…Ø¹Ø§Ù…Ù„ Ø§Ù„Ø­Ø±Ø§Ø±Ø© (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)': 'Temperature coefficient (optional)',
  'ØºØ§Ù„Ø¨Ø§Ù‹ Ø¨ÙŠÙ† â€Ž-0.25 Ùˆâ€Ž-0.50 Ù„ÙƒÙ„ Ø¯Ø±Ø¬Ø©.': 'Usually between -0.25 and -0.50 per degree.', 'Ù‚Ø¯Ø±Ø© Ø§Ù„Ù„ÙˆØ­ Ø§Ù„ÙˆØ§Ø­Ø¯ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)': 'Power per panel (optional)',
  'ØµÙˆØ±Ø© Ø£Ùˆ ÙÙŠØ¯ÙŠÙˆ Ù„Ù„Ø£Ù„ÙˆØ§Ø­': 'Panel photo or video', 'Ø£Ø¶Ù ØµÙˆØ±Ø© Ø£Ùˆ Ù…Ù‚Ø·Ø¹Ø§Ù‹ Ù‚ØµÙŠØ±Ø§Ù‹': 'Add a photo or short video',
  'ØµÙˆØ±Ø© ÙˆØ§Ø¶Ø­Ø© Ø£Ùˆ ÙÙŠØ¯ÙŠÙˆ Ù…Ù† 5 Ø¥Ù„Ù‰ 10 Ø«ÙˆØ§Ù†Ù Â· Ø­ØªÙ‰ 6 Ù…Ù„ÙØ§ØªØŒ 25 Ù…ÙŠØºØ§Ø¨Ø§ÙŠØª Ù„Ù„Ù…Ù„Ù': 'A clear photo or a 5â€“10 second video Â· up to 6 files, 25 MB per file',
  'ØªÙØ­ÙØ¸ Ø§Ù„Ù…Ø±ÙÙ‚Ø§Øª ÙÙŠ Ø­Ø³Ø§Ø¨Ùƒ ÙˆØªØ¸Ù‡Ø± Ø¹Ù„Ù‰ Ø£Ø¬Ù‡Ø²ØªÙƒ. ØªÙØ±Ø³Ù„ Ø¥Ø·Ø§Ø±Ø§Øª ØµÙˆØ± Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø¥Ù„Ù‰ AI ÙÙ‚Ø· Ø¹Ù†Ø¯ Ø¶ØºØ· Â«Ø§Ø¨Ø¯Ø£ Ø§Ù„ØªØ­Ù„ÙŠÙ„Â».': 'Attachments sync to your account and devices. Panel image frames are sent to AI only when you choose â€œAnalyze systemâ€.',
  'Ù‚ÙŠÙ…Ø© Ø§Ù„ÙØ§ØªÙˆØ±Ø©': 'Bill amount', 'Ø§Ù„Ø§Ø³ØªÙ‡Ù„Ø§Ùƒ Ù…Ù† Ø§Ù„ÙØ§ØªÙˆØ±Ø© (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)': 'Bill consumption (optional)',
  'Ø¥Ù† ØªÙˆÙØ±ØŒ Ù†Ø³ØªØ®Ø¯Ù…Ù‡ Ù„Ø§Ø´ØªÙ‚Ø§Ù‚ ØªØ¹Ø±ÙØ© Ø§Ù„ÙƒÙ‡Ø±Ø¨Ø§Ø¡ Ø§Ù„ØªÙ‚Ø±ÙŠØ¨ÙŠØ©.': 'If available, we use it to estimate your electricity rate.',
  'ØªØ¹Ø±ÙØ© Ø§Ù„ÙƒÙ‡Ø±Ø¨Ø§Ø¡ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)': 'Electricity rate (optional)', 'ØªÙØ³ØªØ®Ø¯Ù… Ø¥Ø°Ø§ Ù„Ù… ØªØ¯Ø®Ù„ Ø§Ù„Ø§Ø³ØªÙ‡Ù„Ø§Ùƒ.': 'Used if consumption is not provided.',
  'Ø´Ù‡Ø± Ø§Ù„ÙØ§ØªÙˆØ±Ø©': 'Bill month', 'ØµÙˆØ±Ø© Ø§Ù„ÙØ§ØªÙˆØ±Ø© (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)': 'Bill photo (optional)', 'Ø£Ø±ÙÙ‚ ØµÙˆØ±Ø© Ø§Ù„ÙØ§ØªÙˆØ±Ø©': 'Attach a bill photo',
  'ØªÙØ­ÙØ¸ ÙÙŠ Ø­Ø³Ø§Ø¨Ùƒ ÙˆÙ„Ø§ ØªÙØ±Ø³Ù„ Ù„Ù„ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø¨ØµØ±ÙŠ': 'Saved to your account and not sent for visual analysis.',
  'Ø±Ø§Ø¬Ø¹ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª': 'Review your details', 'Ø§Ø³Ù… ØµØ§Ø­Ø¨ Ø§Ù„Ù†Ø¸Ø§Ù…': 'Account name', 'Ù„Ù… ØªÙØ¶Ù': 'Not added', 'Ù„ÙˆØ­': 'panels',
  'Ù…Ù„Ù Ù„Ù„Ø£Ù„ÙˆØ§Ø­': 'panel file(s)', 'Ù…Ù„ÙØ§Øª Ù„Ù„Ø£Ù„ÙˆØ§Ø­': 'panel files', 'Ø³ÙŠØ­Ø³Ø¨ Ø³ÙŠØ§Ø¬ ÙÙ‚Ø¯ Ø§Ù„Ø·Ø§Ù‚Ø© Ø§Ù„ØªÙ‚Ø¯ÙŠØ±ÙŠ Ù…Ù† Ø§Ù„Ø­Ø±Ø§Ø±Ø© ÙˆØ§Ù„ØºØ¨Ø§Ø± ÙˆØ§Ù„Ø¸Ù„ Ø§Ù„Ù…Ø±Ø¦ÙŠ. Ù‚ÙŠÙ…Ø© Ø§Ù„Ù…Ø§Ù„ ØªÙ‚Ø¯ÙŠØ±ÙŠØ© ÙˆØªØªØºÙŠØ± Ø­Ø³Ø¨ Ø§Ù„ØªØ¹Ø±ÙØ© Ø§Ù„Ù…Ø¯Ø®Ù„Ø©. ': 'Siyaj estimates energy loss from heat, dust, and visible shade. The cost estimate depends on your electricity rate. ',
  'Ø³ÙŠØªÙ… Ø¥Ø±Ø³Ø§Ù„ ØµÙˆØ± Ø§Ù„Ø£Ù„ÙˆØ§Ø­ ÙÙ‚Ø· Ù„Ù„ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø°ÙƒÙŠ.': 'Only panel images will be sent for AI analysis.', 'Ø£Ø¶Ù ØµÙˆØ±Ø© Ù„Ù„Ø£Ù„ÙˆØ§Ø­ ÙÙŠ Ø§Ù„Ø®Ø·ÙˆØ© Ø§Ù„Ø³Ø§Ø¨Ù‚Ø© Ù„ØªÙØ¹ÙŠÙ„ Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø¨ØµØ±ÙŠ.': 'Add a panel photo in the previous step to enable visual analysis.',
  'Ø±Ø­Ù„ØªÙƒ Ù…Ø¹ Ø§Ù„Ø´Ù…Ø³': 'Your solar journey', 'Ø³Ø¬Ù„ Ø§Ù„ÙØ­ÙˆØµØ§Øª': 'Inspection history', 'ÙƒÙ„ Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„ÙØ­Øµ Ø§Ù„Ù…Ø­ÙÙˆØ¸Ø© ÙÙŠ Ø­Ø³Ø§Ø¨Ùƒ.': 'All inspections saved to your account.',
  'ÙØ­Øµ Ø¬Ø¯ÙŠØ¯ ': 'New inspection ', 'Ù„Ø§ ØªÙˆØ¬Ø¯ ÙØ­ÙˆØµØ§Øª Ù…Ø­ÙÙˆØ¸Ø© Ø¨Ø¹Ø¯': 'No saved inspections yet', 'Ø¨Ø¹Ø¯ Ø¥Ø¹Ø¯Ø§Ø¯ Ù†Ø¸Ø§Ù…Ùƒ Ø³ÙŠØ¸Ù‡Ø± Ù‡Ù†Ø§ Ø³Ø¬Ù„ Ø§Ù„ÙØ­ÙˆØµØ§Øª.': 'Your inspections will appear here after system setup.',
  'Ø¹Ø±Ø¶': 'View', 'ÙÙ‚Ø¯ Ø§Ù„Ø·Ø§Ù‚Ø© Ø§Ù„ØªÙ‚Ø¯ÙŠØ±ÙŠ Ø­ÙŠÙ†Ù‡Ø§: ': 'Estimated energy loss then: ', 'ÙÙ‚Ø¯ Ø§Ù„ØªÙ‚Ø¯ÙŠØ±ÙŠ ': 'Estimated loss ',
  'ØªÙØ¶ÙŠÙ„Ø§ØªÙƒ': 'Your preferences', 'Ø®ØµÙ‘Øµ ØªØ¬Ø±Ø¨Ø© Ø³ÙŠØ§Ø¬ Ø¨Ù…Ø§ ÙŠÙ†Ø§Ø³Ø¨Ùƒ.': 'Personalize your Siyaj experience.', 'Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª ÙˆØ§Ù„Ø¹Ø±Ø¶': 'Alerts and display',
  'ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ø§Ù„Ù…ØªØµÙØ­': 'Browser notifications', 'ØªÙ†Ø¨ÙŠÙ‡ Ø¹Ù†Ø¯ ØªØºÙŠØ± Ù…Ù‡Ù… ÙÙŠ Ø§Ù„Ø·Ù‚Ø³': 'Alerts for significant weather changes', 'Ø§Ù„ÙˆØ¶Ø¹ Ø§Ù„Ù„ÙŠÙ„ÙŠ': 'Dark mode',
  'Ø£Ù„ÙˆØ§Ù† Ø£Ù‡Ø¯Ø£ Ø¹Ù†Ø¯ Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù…Ø³Ø§Ø¡Ù‹': 'A softer display for evening use', 'Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡ Ø§Ù„ØµÙˆØªÙŠ': 'Sound alerts', 'ØµÙˆØª Ø¹Ù†Ø¯ Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ø§Ù„Ù…Ù‡Ù…Ø©': 'Play a sound for important alerts',
  'Ø§Ù„Ù„ØºØ©': 'Language', 'Ù„ØºØ© ÙˆØ§Ø¬Ù‡Ø© Ø§Ù„Ù…ÙˆÙ‚Ø¹': 'Interface language', 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©': 'Arabic', 'Ø¨ÙŠØ§Ù†Ø§ØªÙƒ ÙˆØ®ØµÙˆØµÙŠØªÙƒ': 'Your data and privacy',
  'ÙŠØ­ÙØ¸ Ø³ÙŠØ§Ø¬ Ø¨ÙŠØ§Ù†Ø§Øª Ø­Ø³Ø§Ø¨Ùƒ ÙˆØ¥Ø¹Ø¯Ø§Ø¯Ø§ØªÙƒ ÙˆØ³Ø¬Ù„ Ø§Ù„ÙØ­ÙˆØµØ§Øª ÙˆÙ…Ø±ÙÙ‚Ø§ØªÙƒ ÙÙŠ Ø§Ù„ØªØ®Ø²ÙŠÙ† Ø§Ù„Ø³Ø­Ø§Ø¨ÙŠØŒ ÙˆØªØ¸Ù‡Ø± Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ØªÙŠ ØªÙ…Øª Ù…Ø²Ø§Ù…Ù†ØªÙ‡Ø§ Ø¹Ù„Ù‰ Ø£Ø¬Ù‡Ø²ØªÙƒ Ø¹Ù†Ø¯ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ø§Ù„Ø­Ø³Ø§Ø¨ Ù†ÙØ³Ù‡. Ø¹Ù†Ø¯ Ø·Ù„Ø¨ Ø§Ù„ØªØ­Ù„ÙŠÙ„ ÙÙ‚Ø·ØŒ ØªÙØ±Ø³Ù„ ØµÙˆØ± Ø§Ù„Ø£Ù„ÙˆØ§Ø­ ÙˆÙ„Ù‚Ø·Ø§Øª Ù…ÙˆØ²Ø¹Ø© Ù…Ù† Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ø£Ùˆ ØµÙˆØ±Ø© Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ø¥Ù„Ù‰ Anthropic Ù„ØªØ­Ù„ÙŠÙ„Ù‡Ø§ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Claude. ÙŠÙ…ÙƒÙ†Ùƒ Ù…Ø±Ø§Ø¬Ø¹Ø© Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ù‚Ø¨Ù„ Ø§Ø³ØªØ®Ø¯Ø§Ù…Ù‡Ø§. Ø¥Ø­Ø¯Ø§Ø«ÙŠØ§Øª GPS ØªÙØ³ØªØ®Ø¯Ù… Ù„Ø­Ø³Ø§Ø¨ Ø§ØªØ¬Ø§Ù‡ Ø§Ù„Ø´Ù…Ø³ ÙˆØ§Ù„Ø·Ù‚Ø³ ÙˆØ§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ø¹Ù†Ø¯ ØªÙØ¹ÙŠÙ„Ù‡Ø§.': 'Siyaj saves account details, settings, inspection history and attachments in cloud storage and syncs them across your devices. Only when you request analysis, panel photos, sampled video frames or a bill image are sent to Anthropic for assessment by Claude. You can review extracted bill details before applying them. GPS coordinates are used for sun geometry, weather and alerts when enabled.',
  'ØªÙ†Ø²ÙŠÙ„ Ù†Ø³Ø®Ø© Ù…Ù† Ø¨ÙŠØ§Ù†Ø§ØªÙŠ': 'Download my data', 'Ù…Ø³Ø­ Ø¨ÙŠØ§Ù†Ø§Øª Ø­Ø³Ø§Ø¨ÙŠ': 'Clear my account data', 'Ø±ÙÙŠÙ‚Ùƒ Ø§Ù„Ø°ÙƒÙŠ Ù„Ù„Ø·Ø§Ù‚Ø© Ø§Ù„Ø´Ù…Ø³ÙŠØ© Â· Ø¥ØµØ¯Ø§Ø± ØªØ¬Ø±ÙŠØ¨ÙŠ': 'Your smart solar companion Â· Preview',
  'ØµÙÙ†Ø¹ Ø¨Ø¹Ù†Ø§ÙŠØ© Ù„Ù†Ø¹Ø·ÙŠ Ø§Ù„Ø´Ù…Ø³ Ø­Ù‚Ù‡Ø§': 'Made with care, under the sun', 'Ø­Ø³Ø§Ø¨Ùƒ ÙÙŠ Ø³ÙŠØ§Ø¬': 'Your Siyaj account', 'Ø£Ù‡Ù„Ø§Ù‹': 'Welcome',
  'Ø³Ø¬Ù‘Ù„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù„Ù…ØªØ§Ø¨Ø¹Ø© Ù†Ø¸Ø§Ù…Ùƒ Ø§Ù„Ø´Ù…Ø³ÙŠ.': 'Log in to keep up with your solar system.', 'Ø§Ø³ØªØ®Ø¯Ù… Ø¨Ø±ÙŠØ¯Ùƒ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø£Ùˆ Ø±Ù‚Ù… Ù‡Ø§ØªÙÙƒ.': 'Use your email address or phone number.',
  'Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø£Ùˆ Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ': 'Email address or phone number', 'ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±': 'Password', 'Ø£Ø¯Ø®Ù„ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±': 'Enter your password',
  'Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø£Ùˆ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø£Ùˆ Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ': 'Username, email or phone number',
  'Ø¯Ø®ÙˆÙ„ ': 'Log in ', 'Ù„ÙŠØ³ Ù„Ø¯ÙŠÙƒ Ø­Ø³Ø§Ø¨ØŸ ': 'Donâ€™t have an account? ', 'Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨ Ø¬Ø¯ÙŠØ¯': 'Create a new account', 'Ø£Ùˆ': 'OR',
  'Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø© Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Google': 'Continue with Google', 'Ø³Ø¬Ù‘Ù„ Ø¨ÙŠØ§Ù†Ø§ØªÙƒ Ù„Ù„Ø¨Ø¯Ø¡ Ù…Ø¹ Ø³ÙŠØ§Ø¬.': 'Enter your details to get started with Siyaj.',
  'Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ': 'Email address', 'Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ': 'Phone number', '8 Ø£Ø­Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„': 'At least 8 characters',
  'ØªØ£ÙƒÙŠØ¯ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±': 'Confirm password', 'Ø£Ø¹Ø¯ ÙƒØªØ§Ø¨Ø© ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±': 'Enter your password again', 'Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨ ': 'Create account ',
  'Ù„Ø¯ÙŠÙƒ Ø­Ø³Ø§Ø¨ØŸ ': 'Already have an account? ', 'Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Google': 'Sign up with Google', 'ÙŠÙØ­ÙØ¸ Ø§Ù„Ø­Ø³Ø§Ø¨ ÙˆØ§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙˆØ§Ù„Ù…Ø±ÙÙ‚Ø§Øª Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø§Ø¯Ù… ÙˆØªØ¸Ù‡Ø± Ø¹Ù†Ø¯ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù…Ù† Ø£Ø¬Ù‡Ø²ØªÙƒ.': 'Your account, details, and attachments are saved on the server and appear when you sign in on your devices.',
  'Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…': 'Username', 'Ù…Ø«Ø§Ù„: maryam_1': 'Example: maryam_1', 'Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ÙØ±ÙŠØ¯. Ø¨ÙŠØ§Ù†Ø§Øª Ø­Ø³Ø§Ø¨Ùƒ ÙˆÙØ­ÙˆØµØ§ØªÙƒ ÙˆÙ…Ø±ÙÙ‚Ø§ØªÙƒ ØªØªØ²Ø§Ù…Ù† Ø¨ÙŠÙ† Ø£Ø¬Ù‡Ø²ØªÙƒ.': 'Usernames are unique. Your account, inspections, and attachments sync across your devices.',
  'Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ù…Ù† 3 Ø¥Ù„Ù‰ 24 Ø­Ø±ÙØ§Ù‹ Ø£Ùˆ Ø±Ù‚Ù…Ø§Ù‹ØŒ ÙˆÙŠÙ…ÙƒÙ† Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù†Ù‚Ø·Ø© ÙˆØ§Ù„Ø´Ø±Ø·Ø© Ø§Ù„Ø³ÙÙ„ÙŠØ© ÙÙ‚Ø·.': 'Username must be 3â€“24 letters or numbers. Periods and underscores are also allowed.',
  'Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ù…Ø³ØªØ®Ø¯Ù… Ø¨Ø§Ù„ÙØ¹Ù„Ø› Ø§Ø®ØªØ± Ø§Ø³Ù…Ø§Ù‹ Ø¢Ø®Ø±.': 'That username is already taken. Choose another one.',
  'Ø­Ø§Ù„Ø© Ø§Ù„Ø·Ù‚Ø³ Ø§Ù„Ø­Ø§Ù„ÙŠØ©': 'Current weather', 'ØªØ¸Ù‡Ø± Ø¨Ø¹Ø¯ ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…ÙˆÙ‚Ø¹': 'Shown after setting a location',
  'ØªÙ‚Ø¯ÙŠØ± Ù…Ø¨Ø¯Ø¦ÙŠ Ù…Ù† Ø§Ù„ØºØ¨Ø§Ø± Ø§Ù„Ø¬ÙˆÙŠØŒ ÙˆÙ„ÙŠØ³ Ù‚ÙŠØ§Ø³Ø§Ù‹ Ù…Ø¨Ø§Ø´Ø±Ø§Ù‹ Ø¹Ù„Ù‰ Ø³Ø·Ø­ Ø§Ù„Ø£Ù„ÙˆØ§Ø­.': 'Initial estimate from airborne dust, not a direct measurement on the panels.',
  'Ù‡Ø°Ø§ Ø§Ù„Ø­Ø³Ø§Ø¨ Ù…Ø±ØªØ¨Ø· Ø¨Ù€ GoogleØ› ØªØ§Ø¨Ø¹ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Google.': 'This account uses Google. Continue with Google.',
  'ØªØ³Ø¬ÙŠÙ„ Google ÙŠØ­ØªØ§Ø¬ Ø¥Ø¶Ø§ÙØ© GOOGLE_CLIENT_ID Ø¥Ù„Ù‰ Ù…Ù„Ù .env.': 'Google sign-in needs GOOGLE_CLIENT_ID added to the .env file.',
  'ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Google.': 'Signed in with Google.', 'Ù‡Ø°Ø§ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ù…Ø±ØªØ¨Ø· Ø¨Ø­Ø³Ø§Ø¨ Google Ø¢Ø®Ø±.': 'This email is linked to another Google account.',
  'ØªØ¹Ø°Ø± Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø­Ø³Ø§Ø¨ Google.': 'Could not verify the Google account.', 'Ù„Ù… ÙŠØµÙ„ Ø±Ù…Ø² ØªØ³Ø¬ÙŠÙ„ Google.': 'Google sign-in did not return a credential.',
  'Ø±Ù…Ø² Google ØºÙŠØ± ØµØ§Ù„Ø­ Ø£Ùˆ Ø§Ù†ØªÙ‡Øª ØµÙ„Ø§Ø­ÙŠØªÙ‡.': 'The Google credential is invalid or expired.',
  'Ù‡Ù„ ØªØ±ÙŠØ¯ Ù…Ø³Ø­ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø¨ ÙˆÙ…Ø±ÙÙ‚Ø§ØªÙ‡ Ù…Ù† Ø¬Ù…ÙŠØ¹ Ø£Ø¬Ù‡Ø²ØªÙƒØŸ': 'Delete your account data and attachments from all your devices?',
  'ØªØ­Ù„ÙŠÙ„ Ø¨ØµØ±ÙŠ': 'Visual inspection', 'ØªÙ‚Ø¯ÙŠØ± Ø£ÙˆÙ„ÙŠ': 'Initial estimate', 'Ø³Ù…Ø§Ø¡ ØµØ§ÙÙŠØ©': 'Clear sky', 'ØºØ§Ø¦Ù… Ø¬Ø²Ø¦ÙŠØ§Ù‹': 'Partly cloudy',
  'Ø¶Ø¨Ø§Ø¨': 'Fog', 'Ø±Ø°Ø§Ø°': 'Drizzle', 'Ø£Ù…Ø·Ø§Ø±': 'Rain', 'Ø«Ù„ÙˆØ¬': 'Snow', 'Ø¹ÙˆØ§ØµÙ Ø±Ø¹Ø¯ÙŠØ©': 'Thunderstorms', 'Ø­Ø§Ù„Ø© Ù…ØªØºÙŠØ±Ø©': 'Changing conditions',
  'Ù„Ø§ ÙŠØ¸Ù‡Ø± ØºØ¨Ø§Ø± ÙˆØ§Ø¶Ø­': 'No obvious dust visible', 'ØºØ¨Ø§Ø± Ø®ÙÙŠÙ Ø¸Ø§Ù‡Ø±': 'Light dust visible', 'ØºØ¨Ø§Ø± Ù…ØªÙˆØ³Ø· Ø¸Ø§Ù‡Ø±': 'Moderate dust visible',
  'ØºØ¨Ø§Ø± ÙƒØ«ÙŠÙ Ø¸Ø§Ù‡Ø±': 'Heavy dust visible', 'Ø§Ù„ØµÙˆØ±Ø© ØºÙŠØ± ÙˆØ§Ø¶Ø­Ø©': 'Image is unclear', 'ÙŠØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ Ø§Ù†ØªØ¨Ø§Ù‡': 'Needs attention', 'Ù…Ø³ØªÙˆÙ‰ Ù…ØªÙˆØ³Ø·': 'Moderate level', 'Ø£Ø¯Ø§Ø¡ Ù…Ø·Ù…Ø¦Ù†': 'Looking good',
  'Ø§Ù†ØªØ¨Ø§Ù‡': 'Attention', 'Ù…Ø±Ø§Ù‚Ø¨Ø©': 'Monitor', 'Ø¬ÙŠØ¯': 'Good', 'ØªÙ… ÙØ­Øµ Ø¨ØµØ±ÙŠ': 'Visual inspection', 'ÙØ­Øµ Ù…Ø­ÙÙˆØ¸': 'Saved inspection',
  'ØªÙ‚Ø¯ÙŠØ± Ø§Ù„ØºØ¨Ø§Ø± Ù…Ø±ØªÙØ¹Ø§Ù‹': 'dust estimate is high', 'ØªØ§Ø¨Ø¹ Ø§Ù„ØªØºÙŠØ±Ø§Øª ÙÙŠ Ø§Ù„Ø·Ù‚Ø³ ÙˆØ§ÙØ­Øµ Ø³Ø·Ø­ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø¨Ø¹Ø¯ Ø§Ù„Ø¹ÙˆØ§ØµÙ Ø£Ùˆ ÙØªØ±Ø§Øª Ø§Ù„ØºØ¨Ø§Ø±.': 'Watch for weather changes and inspect panels after storms or dusty periods.',
  'Ø­Ø±Ø§Ø±Ø© Ù…Ø±ØªÙØ¹Ø©': 'High temperature', 'ÙÙŠ Ù…ÙˆÙ‚Ø¹ÙƒØ› ØªØ¬Ù†Ø¨ Ù„Ù…Ø³ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ ÙˆÙ‚Øª Ø§Ù„Ø¸Ù‡ÙŠØ±Ø©.': 'at your location; avoid touching panels at midday.',
  'Ù‡Ø¨Ø§Øª Ø±ÙŠØ§Ø­ Ù‚ÙˆÙŠØ© ØªØµÙ„ Ø¥Ù„Ù‰ ': 'Strong wind gusts up to ', ' ÙƒÙ…/Ø³Ø› Ø£Ø¬Ù‘Ù„ Ø§Ù„ØµØ¹ÙˆØ¯ Ø¥Ù„Ù‰ Ø§Ù„Ø³Ø·Ø­ Ø­ØªÙ‰ ØªÙ‡Ø¯Ø£.': ' km/h; wait for calmer conditions before going onto the roof.',
  'Ø§Ø­ØªÙ…Ø§Ù„ Ù‡Ø·ÙˆÙ„ Ù…Ø±ØªÙØ¹ (': 'High chance of rain (', '%)Ø› Ø±Ø§Ù‚Ø¨ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø¨Ø¹Ø¯ Ø§Ù†Ù‚Ø¶Ø§Ø¡ Ø§Ù„Ø·Ù‚Ø³.': '%); check the panels after the weather passes.',
  'ØªÙ… ØªØ­Ø¯ÙŠØ« ØªÙ‚Ø¯ÙŠØ± Ø§Ù„ØºØ¨Ø§Ø± Ø¨Ø¹Ø¯ Ø§Ù„ØªÙ†Ø¸ÙŠÙ.': 'Dust estimate updated after cleaning.', 'ÙˆØ§Ø¬Ù‡Ø© Ø³ÙŠØ§Ø¬ Ù…ØªØ§Ø­Ø© Ø­Ø§Ù„ÙŠØ§Ù‹ Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©.': 'Siyaj is currently available in Arabic.',
  'ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ø§Ù„ØºØ¨Ø§Ø± ÙˆØ§Ù„Ø±ÙŠØ§Ø­': 'Dust and wind push alerts', 'ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ø§Ù„ØºØ¨Ø§Ø± ÙˆØ§Ù„Ø±ÙŠØ§Ø­ Ø¹Ø¨Ø± Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª': 'Push alerts for dusty and windy weather',
  'ÙƒÙ„ ': 'Every ', ' ÙŠÙˆÙ…Ø§Ù‹ ÙƒØ­Ø¯ Ø£Ù‚ØµÙ‰': ' days at most', 'ØªÙˆÙ‚Ø¹Ø§Øª Ø§Ù„ØºØ¨Ø§Ø± Ø§Ù„Ø¬ÙˆÙŠ: Open-Meteo ÙˆCAMS.': 'Air quality forecasts: Open-Meteo and CAMS.',
  'ÙŠØªÙ… Ø¥Ø±Ø³Ø§Ù„ ØªÙ†Ø¨ÙŠÙ‡ Ø§Ù„ØªÙ†Ø¸ÙŠÙ Ù…Ø±Ø© ÙƒÙ„ 14 ÙŠÙˆÙ…Ø§Ù‹ ÙƒØ­Ø¯ Ø£Ù‚ØµÙ‰.': 'Cleaning alerts are limited to once every 14 days.',
  'Ø®Ø³Ø§Ø±Ø© Ø´Ù‡Ø±ÙŠØ© ØªÙ‚Ø¯ÙŠØ±ÙŠØ©': 'Estimated monthly loss', 'Ø®Ø³Ø§Ø±Ø© Ø¨Ø³Ø¨Ø¨ Ø§Ù„ØºØ¨Ø§Ø±:': 'Dust loss:', 'Ø®Ø³Ø§Ø±Ø© Ø¨Ø³Ø¨Ø¨ Ø§Ù„Ø­Ø±Ø§Ø±Ø©:': 'Heat loss:',
  'Ø±.Ø¹ Ø´Ù‡Ø±ÙŠØ§Ù‹': 'OMR / month', 'Ø²Ø§ÙˆÙŠØ© Ù„ÙˆØ­Ùƒ Ø§Ù„Ø­Ø§Ù„ÙŠØ© ØªØ®Ù„ÙŠÙ‡ ÙŠØªØ¬Ù…Ø¹ Ø¹Ù„ÙŠÙ‡ ØºØ¨Ø§Ø± Ø£Ø³Ø±Ø¹ Ù…Ù† Ù„Ùˆ ÙƒØ§Ù†Øª Ù‚Ø±ÙŠØ¨Ø© Ù…Ù† 30 Ø¯Ø±Ø¬Ø©.': 'Your current panel tilt may collect dust faster than an angle close to 30 degrees.',
  'ØªØ­ØªØ§Ø¬ Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ø¥Ù„Ù‰ Ø¥Ø¹Ø¯Ø§Ø¯ Push ÙÙŠ Ø§Ù„Ø®Ø§Ø¯Ù…. Ø±Ø§Ø¬Ø¹ Ù…Ù„Ù README.': 'Push alerts need server setup. See the README.',
  'ØªØ¹Ø°Ø± ØªÙØ¹ÙŠÙ„ Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§ØªØ› ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø¥Ø°Ù† ÙˆØ§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø®Ø§Ø¯Ù….': 'Could not enable alerts. Check permission and server connection.',
  'Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª ØªØ¹Ù…Ù„ Ø¨Ø¹Ø¯ Ø¥Ø¶Ø§ÙØ© Ù…ÙØ§ØªÙŠØ­ VAPID ÙˆØªØ´ØºÙŠÙ„ Ø§Ù„Ø®Ø§Ø¯Ù….': 'Alerts work after adding VAPID keys and starting the server.',
  'ØªØ¹Ø°Ø± Ø­ÙØ¸ Ø³Ø¬Ù„ Ø§Ù„ØªÙ†Ø¸ÙŠÙ Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø§Ø¯Ù….': 'Could not save the cleaning record on the server.',
  'ØªØ¹Ø°Ø± Ø­Ø³Ø§Ø¨ ØªÙØµÙŠÙ„ Ø®Ø³Ø§Ø±Ø© Ø§Ù„Ø­Ø±Ø§Ø±Ø© Ø­Ø§Ù„ÙŠØ§Ù‹.': 'Could not calculate the heat loss breakdown right now.',
  'ØªÙ†Ø¨ÙŠÙ‡ ØºØ¨Ø§Ø± Ù…Ù† Ø³ÙŠØ§Ø¬': 'Dust alert from Siyaj', 'ØªÙ†Ø¨ÙŠÙ‡ ØªÙˆÙ‚ÙŠØª Ø§Ù„ØªÙ†Ø¸ÙŠÙ Ù…Ù† Ø³ÙŠØ§Ø¬': 'Cleaning time alert from Siyaj',
  'Ù„Ù… Ù†Ø¹Ø«Ø± Ø¹Ù„Ù‰ Ù†ØªØ§Ø¦Ø¬. Ø¬Ø±Ù‘Ø¨ ÙƒØªØ§Ø¨Ø© Ø§Ù„Ø§Ø³Ù… Ø¨Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©.': 'No results found. Try entering the name in English.',
  'ØªØ¹Ø°Ø± Ø§Ù„Ø¨Ø­Ø«. ØªØ£ÙƒØ¯ Ù…Ù† ØªØ´ØºÙŠÙ„ Ø§Ù„Ø®Ø§Ø¯Ù….': 'Search failed. Make sure the local server is running.',
  'Ù„Ù… ÙŠØªÙ… ØªÙØ¹ÙŠÙ„ Ø¥Ø°Ù† Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª.': 'Notification permission was not granted.', 'ØªÙ… ØªÙØ¹ÙŠÙ„ Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª.': 'Notifications enabled.', 'ØªÙ… Ø¥ÙŠÙ‚Ø§Ù Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª.': 'Notifications disabled.',
  'ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ù‡Ø°Ø§ Ø§Ù„Ø¬Ù‡Ø§Ø² ÙÙ‚Ø·': 'Alerts on this device only',
  'Ù…ÙØ¹Ù‘Ù„Ø© Ø¹Ù„Ù‰ Ù‡Ø°Ø§ Ø§Ù„Ø¬Ù‡Ø§Ø²': 'Enabled on this device', 'ØºÙŠØ± Ù…ÙØ¹Ù‘Ù„Ø© Ø¹Ù„Ù‰ Ù‡Ø°Ø§ Ø§Ù„Ø¬Ù‡Ø§Ø²': 'Not enabled on this device',
  'ØªØ¹Ø°Ø± Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ù‡Ø°Ø§ Ø§Ù„Ø¬Ù‡Ø§Ø².': 'Could not check alerts on this device.',
  'ØªØ¹Ø°Ø± Ø¥ÙŠÙ‚Ø§Ù ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ù‡Ø°Ø§ Ø§Ù„Ø¬Ù‡Ø§Ø².': 'Could not disable alerts on this device.',
  'ØªØ¹Ø°Ø± ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬Ø› Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.': 'Could not log out. Please try again.',
  'ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„ØªÙ†Ø¸ÙŠÙ ÙˆØªØ­Ø¯ÙŠØ« ØªÙ‚Ø¯ÙŠØ± Ø§Ù„ØºØ¨Ø§Ø±.': 'Cleaning was recorded and the dust estimate was updated.',
  'Ù„Ù… ØªØªÙˆÙØ± Ø¨ÙŠØ§Ù†Ø§Øª ÙƒØ§ÙÙŠØ© Ù„Ø­Ø³Ø§Ø¨ Ø®Ø³Ø§Ø±Ø© Ø§Ù„Ø­Ø±Ø§Ø±Ø©Ø› Ø§Ù„ØªÙ‚Ø¯ÙŠØ± Ø§Ù„Ø­Ø§Ù„ÙŠ ÙŠØ´Ù…Ù„ Ø§Ù„ØºØ¨Ø§Ø± ÙˆØ§Ù„Ø¸Ù„ ÙÙ‚Ø·.': 'There is not enough data to calculate heat loss; this estimate includes dust and shade only.',
  'ÙŠÙˆÙ…ÙŠØ§Ù‹ ÙˆÙÙ‚ ØªÙ‚Ø¯ÙŠØ± Ø§Ù„ØºØ¨Ø§Ø± ÙˆØ§Ù„Ø¸Ù„.': 'per day based on estimated dust and shade.',
  'ØªÙ… Ù…Ø³Ø­ Ø¨ÙŠØ§Ù†Ø§Øª Ø­Ø³Ø§Ø¨Ùƒ.': 'Your account data was cleared.', 'ØªÙ… ØªÙ†Ø²ÙŠÙ„ Ù†Ø³Ø®Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª.': 'Data export downloaded.', 'ØªÙ… ØªØ­Ø¯ÙŠØ¯ Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ù†Ø¸Ø§Ù….': 'System location set.',
  'Ù„Ù… Ù†ØªÙ…ÙƒÙ† Ù…Ù† ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…ÙˆÙ‚Ø¹. ØªØ­Ù‚Ù‚ Ù…Ù† Ø¥Ø°Ù† Ø§Ù„Ù…ÙˆÙ‚Ø¹ ÙÙŠ Ø§Ù„Ù…ØªØµÙØ­.': 'Could not get your location. Check your browser location permission.',
  'Ø­Ø¯Ù‘Ø¯ Ù…Ø¯ÙŠÙ†Ø© Ø£Ùˆ Ø§Ø³ØªØ®Ø¯Ù… GPS Ø£ÙˆÙ„Ø§Ù‹.': 'Choose a city or use GPS first.', 'Ø£Ø¯Ø®Ù„ Ø¹Ø¯Ø¯ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø£ÙˆÙ„Ø§Ù‹.': 'Enter the number of panels first.',
  'ØªØ£ÙƒØ¯ Ù…Ù† Ø¯Ø±Ø¬Ø© Ø­Ø±Ø§Ø±Ø© Ø§Ù„Ø¬Ùˆ.': 'Check the air temperature.', 'Ø§Ù„Ø±Ø·ÙˆØ¨Ø© ÙŠØ¬Ø¨ Ø£Ù† ØªÙƒÙˆÙ† Ø¨ÙŠÙ† 0 Ùˆ100%.': 'Humidity must be between 0 and 100%.',
  'Ø£Ø¯Ø®Ù„ Ø§Ù„Ù‚Ø¯Ø±Ø© Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠØ© Ù„Ù„Ù†Ø¸Ø§Ù….': 'Enter the total system capacity.', 'Ø£Ø¶Ù Ù‚ÙŠÙ…Ø© Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„ØªØ¹Ø±ÙØ© Ø§Ù„ØªÙ‚Ø±ÙŠØ¨ÙŠØ©.': 'Enter the bill amount to estimate the electricity rate.',
  'Ø§ÙƒØªØ¨ Ø§Ø³Ù… Ù…Ø¯ÙŠÙ†Ø© Ù„Ù„Ø¨Ø­Ø«.': 'Enter a city name to search.', 'Ø§Ø®ØªØ± ØµÙˆØ±Ø© Ø£Ùˆ ÙÙŠØ¯ÙŠÙˆ Ù…Ø¯Ø¹ÙˆÙ…Ø§Ù‹.': 'Choose a supported image or video.',
  'ÙŠÙ…ÙƒÙ† Ø¥Ø±ÙØ§Ù‚ Ø§Ù„ÙØ§ØªÙˆØ±Ø© ÙƒØµÙˆØ±Ø©.': 'The bill can be attached as an image.', 'ÙŠÙ…ÙƒÙ†Ùƒ Ø¥Ø¶Ø§ÙØ© 6 Ù…Ù„ÙØ§Øª ÙƒØ­Ø¯ Ø£Ù‚ØµÙ‰.': 'You can add up to 6 files.',
  'ØªØ¹Ø°Ø± Ø­ÙØ¸ Ø§Ù„Ù…Ù„Ù Ù…Ø­Ù„ÙŠØ§Ù‹Ø› Ø¬Ø±Ù‘Ø¨ Ù…Ù„ÙØ§Ù‹ Ø£ØµØºØ±.': 'Could not save the file locally. Try a smaller file.',
  'Ø§Ø®ØªØ± JPG Ø£Ùˆ PNG Ø£Ùˆ WEBP Ø£Ùˆ ÙÙŠØ¯ÙŠÙˆ MP4 Ø£Ùˆ WEBM Ø£Ùˆ MOV.': 'Choose JPG, PNG, WEBP, MP4, WEBM, or MOV.', 'ÙŠØ¬Ø¨ Ø£Ù„Ø§ ÙŠØªØ¬Ø§ÙˆØ² Ø­Ø¬Ù… Ø§Ù„Ù…Ù„Ù 25 Ù…ÙŠØºØ§Ø¨Ø§ÙŠØª.': 'Each file must be 25 MB or smaller.',
  'Ø£Ø¶Ù ØµÙˆØ±Ø© Ø£Ùˆ ÙÙŠØ¯ÙŠÙˆ Ù„Ù„Ø£Ù„ÙˆØ§Ø­ Ù„ØªÙØ¹ÙŠÙ„ Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø¨ØµØ±ÙŠ Ø¨Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ.': 'Add a panel photo or video to enable AI visual analysis.',
  'Ø§Ù„Ù‚Ø¯Ø±Ø© Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠØ©': 'Total capacity', 'Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ø§Ù„Ø´Ù‡Ø±ÙŠØ©': 'Monthly bill', 'Ù„Ù… ØªØªÙ… Ø¥Ø¶Ø§ÙØ© Ø¨ÙŠØ§Ù†Ø§Øª Ø¨Ø¹Ø¯.': 'No system details added yet.',
  'Ø£Ø¯Ø®Ù„ Ø¨Ø±ÙŠØ¯Ø§Ù‹ Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØ§Ù‹ ØµØ§Ù„Ø­Ø§Ù‹.': 'Enter a valid email address.', 'Ø£Ø¯Ø®Ù„ Ø±Ù‚Ù… Ù‡Ø§ØªÙ ØµØ§Ù„Ø­Ø§Ù‹.': 'Enter a valid phone number.',
  'ÙŠØ¬Ø¨ Ø£Ù† ØªØªÙƒÙˆÙ† ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ù…Ù† 8 Ø£Ø­Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„.': 'Password must be at least 8 characters.', 'ÙƒÙ„Ù…ØªØ§ Ø§Ù„Ù…Ø±ÙˆØ± ØºÙŠØ± Ù…ØªØ·Ø§Ø¨Ù‚ØªÙŠÙ†.': 'The passwords do not match.',
  'Ù‡Ø°Ø§ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø£Ùˆ Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ Ù…Ø³Ø¬Ù„ Ù…Ø³Ø¨Ù‚Ø§Ù‹.': 'This email or phone number is already registered.', 'ØªØ¹Ø°Ø± Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨.': 'Could not create the account.',
  'Ù„Ù… Ù†Ø¹Ø«Ø± Ø¹Ù„Ù‰ Ù‡Ø°Ø§ Ø§Ù„Ø­Ø³Ø§Ø¨ ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„Ù…ØªØµÙØ­. Ø£Ù†Ø´Ø¦ Ø­Ø³Ø§Ø¨Ø§Ù‹ Ø£ÙˆÙ„Ø§Ù‹.': 'This account was not found in this browser. Create an account first.',
  'ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ØºÙŠØ± ØµØ­ÙŠØ­Ø©.': 'Incorrect password.', 'ØªØ¹Ø°Ø± ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„.': 'Could not log in.', 'ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨ ÙˆØ­ÙØ¸Ù‡ Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø§Ø¯Ù….': 'Account created and saved on the server.',
  'ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„.': 'You are logged in.', 'ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬.': 'You are logged out.', 'ØªØ³Ø¬ÙŠÙ„ Google ÙŠØ­ØªØ§Ø¬ Ø¥Ø¹Ø¯Ø§Ø¯ OAuth Ù…Ù† Google Ù‚Ø¨Ù„ ØªÙØ¹ÙŠÙ„Ù‡.': 'Google sign-in needs Google OAuth configuration before it can be enabled.',
  'ÙŠØªØ·Ù„Ø¨ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø­Ø³Ø§Ø¨ Ù…ØªØµÙØ­Ø§Ù‹ Ø¢Ù…Ù†Ø§Ù‹ Ù…Ø«Ù„ localhost.': 'Account creation requires a secure browser context such as localhost.',
  'ÙÙ‚Ø¯ Ø§Ù„Ø·Ø§Ù‚Ø© Ø§Ù„ØªÙ‚Ø¯ÙŠØ±ÙŠ Ø­ÙŠÙ†Ù‡Ø§: ': 'Estimated energy loss then: ', 'ÙØ§ØªÙˆØ±Ø©': 'Bill', 'Ø§Ø³ØªÙ‡Ù„Ø§Ùƒ': 'Consumption', 'ØªÙ†Ø¨ÙŠÙ‡': 'Alert',
  'ØªÙ… ØªØ­Ø¯ÙŠØ¯ Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ù†Ø¸Ø§Ù….': 'System location set.', 'ØªÙ… ØªØ­Ø¯ÙŠØ« ØªÙ‚Ø¯ÙŠØ± Ø§Ù„ØºØ¨Ø§Ø± Ø¨Ø¹Ø¯ Ø§Ù„ØªÙ†Ø¸ÙŠÙ.': 'Dust estimate updated after cleaning.',
  'ÙÙ‚Ø¯ Ø§Ù„ÙŠÙˆÙ… ': 'Todayâ€™s loss: ', 'Ø¥Ø´Ø¹Ø§Ø¹ Ø§Ù„Ø´Ù…Ø³ ÙŠØªØºÙŠØ± Ø­Ø³Ø¨ Ø§Ù„Ø·Ù‚Ø³': 'Sunshine varies with the weather',
  'Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø¨ÙŠØ§Ù†Ø§Øª Ù†Ø¸Ø§Ù…Ùƒ': 'Waiting for your system details', 'ØªÙ… Ø§Ù„ØªÙ†Ø¸ÙŠÙ': 'Cleaned',
  'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬': 'Log out', 'name@example.com Ø£Ùˆ Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ': 'name@example.com or phone number',
  'Ø±.Ø¹': 'OMR', 'Ùƒ.Ùˆ.Ø³': 'kWh', 'ÙˆØ§Ø·': 'W', 'Â°Ù…': 'Â°C', 'ÙƒÙ…/Ø³': 'km/h',
  'Ø§Ù„ØªØ¹Ø±ÙØ© Ø§Ù„ØªÙŠ Ø£Ø¯Ø®Ù„ØªÙ‡Ø§': 'the rate you entered', 'Ù…Ø´ØªÙ‚Ø© Ù…Ù† Ø§Ù„ÙØ§ØªÙˆØ±Ø© ÙˆØ§Ù„Ø§Ø³ØªÙ‡Ù„Ø§Ùƒ': 'derived from your bill and consumption', 'ØªØ¹Ø±ÙØ© Ù…Ø±Ø¬Ø¹ÙŠØ© Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„ØªØºÙŠÙŠØ±': 'editable reference rate',
  'ØªÙ‚Ø±ÙŠØ¨Ø§Ù‹': 'approx.', 'Ù‚Ø¯ ÙŠÙÙ‚Ø¯ Ø§Ù„Ù†Ø¸Ø§Ù… Ù†Ø­Ùˆ ': 'The system may lose about ', ' ÙŠÙˆÙ…ÙŠØ§Ù‹ ÙˆÙÙ‚ ØªÙ‚Ø¯ÙŠØ± Ø§Ù„Ø­Ø±Ø§Ø±Ø© ÙˆØ§Ù„ØºØ¨Ø§Ø± ÙˆØ§Ù„Ø¸Ù„.': ' per day based on estimated heat, dust, and shade.',
  ' ÙÙŠ Ù…ÙˆÙ‚Ø¹ÙƒØ› ØªØ¬Ù†Ø¨ Ù„Ù…Ø³ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ ÙˆÙ‚Øª Ø§Ù„Ø¸Ù‡ÙŠØ±Ø©.': ' at your location; avoid touching panels at midday.',
  'Ø§Ù„Ù…ØªØµÙØ­ Ù„Ø§ ÙŠØ¯Ø¹Ù… ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…ÙˆÙ‚Ø¹.': 'Your browser does not support location services.', 'ØªØ¹Ø°Ø± Ø¬Ù„Ø¨ Ø­Ø§Ù„Ø© Ø§Ù„Ø·Ù‚Ø³.': 'Could not load weather.',
  'ØªØ¹Ø°Ø± ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø·Ù‚Ø³.': 'Could not refresh the weather.', 'ØªØ¹Ø°Ø± Ø¬Ù„Ø¨ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø·Ù‚Ø³ Ø§Ù„Ø¢Ù†.': 'Weather data is unavailable right now.',
  'ØªØ¹Ø°Ø± Ø¬Ù„Ø¨ Ø§Ù„Ø·Ù‚Ø³ Ø§Ù„Ø¢Ù†. Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰ Ø¨Ø¹Ø¯ Ù‚Ù„ÙŠÙ„ Ø£Ùˆ Ø£Ø¯Ø®Ù„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙŠØ¯ÙˆÙŠÙ‹Ø§.': 'Weather data is unavailable right now. Try again shortly or enter the readings manually.',
  'Ø¥Ø­Ø¯Ø§Ø«ÙŠØ§Øª Ø§Ù„Ù…ÙˆÙ‚Ø¹ ØºÙŠØ± ØµØ§Ù„Ø­Ø©.': 'The location coordinates are invalid.',
  'ØªØ¹Ø°Ø± ØªÙ†ÙÙŠØ° Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø°ÙƒÙŠ.': 'Could not run AI analysis.', 'ØªØ¹Ø°Ø± ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ù…Ø±ÙÙ‚ Ø§Ù„Ø¢Ù†.': 'Could not analyze the attachment right now.',
  'Ù„Ù… ÙŠØµÙ„ Ø±Ø¯ Ù‚Ø§Ø¨Ù„ Ù„Ù„Ù‚Ø±Ø§Ø¡Ø© Ù…Ù† Ø®Ø¯Ù…Ø© Ø§Ù„ØªØ­Ù„ÙŠÙ„.': 'The analysis service returned an unreadable response.',
  'Ø­Ø±Ø§Ø±Ø© Ù…Ø±ØªÙØ¹Ø©': 'High temperature', 'Ù‡Ø¨Ø§Øª Ø±ÙŠØ§Ø­ Ù‚ÙˆÙŠØ© ØªØµÙ„ Ø¥Ù„Ù‰ ': 'Strong wind gusts up to ',
  'Ø§Ø­ØªÙ…Ø§Ù„ Ù‡Ø·ÙˆÙ„ Ù…Ø±ØªÙØ¹ (': 'High chance of rain (', '%)Ø› Ø±Ø§Ù‚Ø¨ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø¨Ø¹Ø¯ Ø§Ù†Ù‚Ø¶Ø§Ø¡ Ø§Ù„Ø·Ù‚Ø³.': '%); check the panels after the weather passes.',
  'Ø¬Ø§Ø±ÙŠ ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…ÙˆÙ‚Ø¹â€¦': 'Getting locationâ€¦', 'Ø¬Ø§Ø±Ù Ø§Ù„Ø¨Ø­Ø«â€¦': 'Searchingâ€¦', 'ØªØ¹Ø°Ø± Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©.': 'Could not search for the city.',
  'Ù„Ù… Ù†Ø¹Ø«Ø± Ø¹Ù„Ù‰ Ù†ØªØ§Ø¦Ø¬. Ø¬Ø±Ù‘Ø¨ ÙƒØªØ§Ø¨Ø© Ø§Ù„Ø§Ø³Ù… Ø¨Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©.': 'No results found. Try entering the name in English.',
  'ØªØ¹Ø°Ø± Ø§Ù„Ø¨Ø­Ø«. ØªØ£ÙƒØ¯ Ù…Ù† ØªØ´ØºÙŠÙ„ Ø§Ù„Ø®Ø§Ø¯Ù….': 'Search failed. Make sure the local server is running.',
  'Ø§Ù„Ø±Ù…Ø² Ø§Ù„Ø¨Ø±ÙŠØ¯ÙŠ': 'Postal code',
  ' Ø§Ù„Ù†ØªÙŠØ¬Ø© Ø§Ù„Ø­Ø§Ù„ÙŠØ© ØªÙ‚Ø¯ÙŠØ±ÙŠØ© ÙˆØªØ¹ØªÙ…Ø¯ Ø¹Ù„Ù‰ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ØªÙŠ Ø£Ø¯Ø®Ù„ØªÙ‡Ø§.': ' This is an estimate based on the details you entered.',
  'Ø£Ø¶Ù Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù… Ø£ÙˆÙ„Ø§Ù‹': 'Add system details first', 'ØªÙ‚Ø¯ÙŠØ±Ø§Øª Ø£ÙˆÙ„ÙŠØ©': 'Initial estimates',
  'ÙŠØ¸Ù‡Ø± ØªÙ‚Ø¯ÙŠØ± Ø§Ù„ØºØ¨Ø§Ø± Ù…Ø±ØªÙØ¹Ø§Ù‹Ø› ØªØ­Ù‚Ù‚ Ø¨ØµØ±ÙŠØ§Ù‹ Ù…Ù† Ø§Ù„Ø£Ù„ÙˆØ§Ø­ ÙˆÙ†Ø¸Ù‘ÙÙ‡Ø§ Ø¹Ù†Ø¯ Ø§Ù„Ø­Ø§Ø¬Ø© ÙˆØ¨Ø·Ø±ÙŠÙ‚Ø© Ø¢Ù…Ù†Ø©.': 'Dust may be high; inspect the panels and clean them safely if needed.',
  'ØªØ§Ø¨Ø¹ Ø§Ù„ØªØºÙŠØ±Ø§Øª ÙÙŠ Ø§Ù„Ø·Ù‚Ø³ ÙˆØ§ÙØ­Øµ Ø³Ø·Ø­ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø¨Ø¹Ø¯ Ø§Ù„Ø¹ÙˆØ§ØµÙ Ø£Ùˆ ÙØªØ±Ø§Øª Ø§Ù„ØºØ¨Ø§Ø±.': 'Watch for weather changes and inspect the panels after storms or dusty periods.',
  'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©': 'Arabic', 'English': 'English', 'PM10': 'PM10', 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ': 'Unknown',
  'Ø§Ù„Ø¨Ù„Ø§ØºØ§Øª ÙˆØ§Ù„Ø´ÙƒØ§ÙˆÙ‰': 'Complaints & reports', 'ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ù†Ø¸Ø§Ù…': 'System report',
  'ØªÙˆØ§ØµÙ„ Ù…Ø¨Ø§Ø´Ø± Ù…Ø¹ ÙØ±ÙŠÙ‚ Ø§Ù„ØµÙŠØ§Ù†Ø©': 'Direct contact with the maintenance team',
  'Ø£Ø±Ø³Ù„ Ø¨Ù„Ø§ØºØ§Ù‹ Ø¹Ù† Ø£ÙŠ Ù…Ø´ÙƒÙ„Ø© ÙÙŠ Ù†Ø¸Ø§Ù…Ùƒ Ø§Ù„Ø´Ù…Ø³ÙŠØŒ ÙˆØ³ÙŠØ±Ø³Ù„ Ù…Ø¨Ø§Ø´Ø±Ø© Ø¥Ù„Ù‰ ÙØ±ÙŠÙ‚ Ø§Ù„ØµÙŠØ§Ù†Ø©.': 'Send a complaint about any issue with your solar system and it reaches the maintenance team directly.',
  'Ø¨Ù„Ø§Øº Ø¬Ø¯ÙŠØ¯': 'New complaint', 'Ø§ÙƒØªØ¨ Ø¨Ù„Ø§ØºÙƒ': 'Write your complaint',
  'Ø³ÙŠÙØ±Ø³Ù„ Ø§Ù„Ø¨Ù„Ø§Øº Ø¥Ù„Ù‰ ÙØ±ÙŠÙ‚ Ø§Ù„ØµÙŠØ§Ù†Ø© Ù…Ø¨Ø§Ø´Ø±Ø©.': 'Your complaint is sent to the maintenance team directly.',
  'Ø§Ù„Ø§Ø³Ù… (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)': 'Name (optional)', 'ÙˆØ³ÙŠÙ„Ø© Ø§Ù„ØªÙˆØ§ØµÙ„ (Ø¨Ø±ÙŠØ¯ Ø£Ùˆ Ù‡Ø§ØªÙ)': 'Contact (email or phone)',
  'Ù†ÙˆØ¹ Ø§Ù„Ø¨Ù„Ø§Øº': 'Complaint type', 'Ø§Ù„Ù…ÙˆØ¶ÙˆØ¹ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)': 'Subject (optional)', 'ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø¨Ù„Ø§Øº': 'Complaint details',
  'Ø¶Ø¹Ù ÙÙŠ Ø§Ù„Ø¥Ù†ØªØ§Ø¬': 'Low generation', 'ØºØ¨Ø§Ø± Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù„ÙˆØ§Ø­': 'Dust on panels',
  'ØªØ¸Ù„ÙŠÙ„ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù„ÙˆØ§Ø­': 'Shading on panels', 'Ù…Ø´ÙƒÙ„Ø© ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠØ©': 'Electrical issue',
  'Ø·Ù„Ø¨ ØµÙŠØ§Ù†Ø©': 'Maintenance request', 'Ø£Ø®Ø±Ù‰': 'Other',
  'Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø¨Ù„Ø§Øº': 'Send complaint', 'Ù…Ø´Ø§Ø±ÙƒØ© / Ù†Ø³Ø® Ø§Ù„Ø¨Ù„Ø§Øº': 'Share / copy complaint',
  'Ø¨Ù„Ø§ØºØ§ØªÙŠ Ø§Ù„Ø³Ø§Ø¨Ù‚Ø©': 'My complaints', 'Ù…Ù„Ø®Øµ Ø¬Ø§Ù‡Ø² Ù„Ù„Ù…Ø´Ø§Ø±ÙƒØ©': 'Summary ready to share',
  'ØªÙ‚Ø±ÙŠØ± Ø´Ø§Ù…Ù„ ÙŠÙ…ÙƒÙ† ØªÙ†Ø²ÙŠÙ„Ù‡ PDF Ø£Ùˆ Ù…Ø´Ø§Ø±ÙƒØªÙ‡ Ù…Ø¹ Ø´Ø±ÙƒØ© Ø§Ù„ØµÙŠØ§Ù†Ø©.': 'A full report you can download as PDF or share with a maintenance company.',
  'ØªÙ†Ø²ÙŠÙ„ PDF': 'Download PDF', 'Ø·Ø¨Ø§Ø¹Ø©': 'Print', 'Ù…Ø´Ø§Ø±ÙƒØ©': 'Share',
  'Ø¬Ø§Ø±Ù ØªØ¬Ù‡ÙŠØ² Ø³ÙŠØ§Ø¬â€¦': 'Preparing Siyajâ€¦', 'Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø©': 'Try again',
  'ÙŠØªÙ… Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø®Ø§Ø¯Ù… ÙˆØªØ­Ù…ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§ØªÙƒØŒ Ù„Ø­Ø¸Ø§Øª Ù…Ù† ÙØ¶Ù„Ùƒ.': 'Contacting the server and loading your data, just a moment.',
  'ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø·Ù‚Ø³ ÙˆØ§Ù„Ù…ÙˆÙ‚Ø¹': 'Update weather and location',
  'Ù…Ø«Ø§Ù„: Ù…Ø±ÙŠÙ…': 'e.g. Mariam', 'name@example.com Ø£Ùˆ Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ': 'name@example.com or a phone number',
  'Ù…Ø«Ø§Ù„: ØªÙ†Ø¸ÙŠÙ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ ÙÙŠ Ø§Ù„Ø´ØªØ§Ø¡': 'e.g. panel cleaning in winter',
  'ØµÙ Ø§Ù„Ù…Ø´ÙƒÙ„Ø© ÙˆÙ…ØªÙ‰ Ù„Ø§Ø­Ø¸ØªÙ‡Ø§â€¦': 'Describe the issue and when you noticed itâ€¦',
  'ØµÙŠØ§Ù†Ø© Ø§Ù„Ø£Ù„ÙˆØ§Ø­': 'Panel maintenance',
  'Ø¯ÙˆØ±Ø© Ø§Ù„ØµÙŠØ§Ù†Ø© ÙƒÙ„ 6 Ø£Ø´Ù‡Ø±': 'Maintenance cycle every 6 months',
  'ØªÙ…Øª Ø§Ù„ØµÙŠØ§Ù†Ø© Ø§Ù„ÙŠÙˆÙ… âœ“': 'Maintenance done today âœ“',
  'Ø§Ø³Ù… Ø´Ø±ÙƒØ© Ø§Ù„Ø£Ù„ÙˆØ§Ø­': 'Panel company name',
  'Ø¢Ø®Ø± ØµÙŠØ§Ù†Ø© Ù„Ù„Ø£Ù„ÙˆØ§Ø­': 'Last panel maintenance',
  'Ø¢Ø®Ø± ØµÙŠØ§Ù†Ø©': 'Last maintenance',
  'Ø§Ù„ØµÙŠØ§Ù†Ø© Ø§Ù„Ù‚Ø§Ø¯Ù…Ø©': 'Next maintenance',
  'Ù…ÙˆØ¹Ø¯ Ø§Ù„ØµÙŠØ§Ù†Ø© Ø§Ù„Ù‚Ø§Ø¯Ù…Ø©': 'Next maintenance due',
  'Ù„Ù… ØªÙØ³Ø¬Ù„': 'Not recorded',
  'Ø´Ø±ÙƒØ© Ø§Ù„Ø£Ù„ÙˆØ§Ø­': 'Panel company',
  'Ø§Ù„Ø´Ø±ÙƒØ©': 'Company',
  'Ø§Ù„Ù…ØµÙ†Ø¹': 'Manufacturer',
  'ØºÙŠØ± Ù…Ø­Ø¯Ø¯Ø©': 'Not set',
  'Ø£Ø¶Ù ØªØ§Ø±ÙŠØ® Ø¢Ø®Ø± ØµÙŠØ§Ù†Ø©': 'Add the last maintenance date',
};
const ORIGINAL_TEXT = new WeakMap();
const ORIGINAL_ATTRIBUTES = new WeakMap();
const TRANSLATION_KEYS = Object.keys(TRANSLATIONS).sort((a, b) => b.length - a.length);
const DEFAULT_STATE = {
  form: { name: '', ambientTemp: '', ambientTempManual: false, humidity: '', humidityManual: false, panels: '', dust: null, dustManual: false, airDustPercent: null, airDustManual: false, weatherCode: null, location: '', latitude: null, longitude: null, power: '', brand: '', company: '', lastMaintenanceAt: '', tilt: '', panelAzimuth: '', captureAt: '', panelType: 'monocrystalline', efficiency: '', coefficient: '-0.35', ratedPower: '', invoice: '', consumption: '', tariff: '', expectedMonthlyKwh: '', actualMonthlyKwh: '', billMonth: new Date().toISOString().slice(0, 7) },
  settings: { notifications: false, dark: false, sound: false, language: 'ar' },
  weather: null, ai: null, aiLanguage: null, aiModel: null, solarContext: null, monthlyLoss: null, result: null, history: [], complaints: [], onboarded: false, updatedAt: null, user: null,
  lastCleanedAt: null, tiltWarningSeenFor: null,
  weatherPrefill: { ambientTemp: null, humidity: null, airDustPercent: null },
};
let currentAccount = null;
let state = loadState(`${STORAGE_KEY}.guest`);
let media = [];
let currentStep = 0;
let toastTimer;
let panelSyncTimer;
let accountSyncTimer;
let appSettings = null;
let devicePushEnabled = false;
let devicePushStateKnown = false;
let devicePushBusy = false;
let claudeEnabled = null;
let aiConfigurationChecked = false;
let invoiceReview = null;
let invoiceBusy = false;
let analysisSequence = 0;
let invoiceSequence = 0;
let analysisController = null;
let invoiceController = null;
let analysisBusy = false;
let weatherSequence = 0;
let manufacturerPickerController = null;
let gpsNotice = null;
let weatherNotice = null;
let complaintConfig = { email: 'shathaalbaraa67@gmail.com', delivery: false };

// ---------- Ø´Ø±ÙŠØ· Ø§Ù„ØªÙ‚Ø¯Ù… Ø§Ù„Ø¹Ù„ÙˆÙŠ: ÙŠØ¸Ù‡Ø± Ù„ÙƒÙ„ Ø·Ù„Ø¨ Ø´Ø¨ÙƒØ© Ø¬Ø§Ø±Ù ----------
let pendingRequests = 0;
let requestProgressTimer = null;
function updateRequestProgress() {
  const bar = el('app-progress');
  if (!bar) return;
  if (pendingRequests > 0) {
    clearTimeout(requestProgressTimer);
    requestProgressTimer = setTimeout(() => {
      if (pendingRequests > 0) { bar.classList.add('loading'); bar.setAttribute('aria-hidden', 'false'); }
    }, 150);
  } else {
    clearTimeout(requestProgressTimer);
    bar.classList.remove('loading');
    bar.setAttribute('aria-hidden', 'true');
  }
}
if (typeof window !== 'undefined' && window.fetch) {
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (...args) => {
    pendingRequests += 1;
    updateRequestProgress();
    return nativeFetch(...args).finally(() => { pendingRequests = Math.max(0, pendingRequests - 1); updateRequestProgress(); });
  };
}

// ---------- Ø´Ø§Ø´Ø© Ø§Ù„ØªØ­Ù…ÙŠÙ„ Ø¹Ù†Ø¯ ØªØ£Ø®Ø± Ø§Ù„Ø®Ø§Ø¯Ù… ----------
let bootstrapSettled = false;
let introActive = false;
let loadingSlowTimer = null;
function showLoadingScreen(title, note) {
  const screen = el('app-loading');
  if (!screen) return;
  screen.hidden = false;
  const titleNode = el('app-loading-title');
  const noteNode = el('app-loading-note');
  const retry = el('app-loading-retry');
  if (titleNode && title) titleNode.textContent = title;
  if (noteNode) { noteNode.textContent = note || ui('ÙŠØªÙ… Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø®Ø§Ø¯Ù… ÙˆØªØ­Ù…ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§ØªÙƒØŒ Ù„Ø­Ø¸Ø§Øª Ù…Ù† ÙØ¶Ù„Ùƒ.', 'Contacting the server and loading your data, just a moment.'); noteNode.classList.remove('slow'); }
  if (retry) { retry.hidden = true; retry.onclick = () => window.location.reload(); }
  clearTimeout(loadingSlowTimer);
  loadingSlowTimer = setTimeout(() => {
    if (screen.hidden) return;
    if (noteNode) { noteNode.textContent = ui('ÙŠØ¨Ø¯Ùˆ Ø£Ù† Ø§Ù„Ø®Ø§Ø¯Ù… ÙŠØ³ØªØºØ±Ù‚ ÙˆÙ‚ØªØ§Ù‹ Ø£Ø·ÙˆÙ„ Ù…Ù† Ø§Ù„Ù…Ø¹ØªØ§Ø¯. ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø§ØªØµØ§Ù„ Ø«Ù… Ø£Ø¹Ø¯ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø©.', 'The server is taking longer than usual. Check your connection and try again.'); noteNode.classList.add('slow'); }
    if (retry) retry.hidden = false;
  }, 10000);
}
function hideLoadingScreen() {
  const screen = el('app-loading');
  if (!screen) return;
  clearTimeout(loadingSlowTimer);
  screen.hidden = true;
}

function ui(arabic, english) { return state.settings.language === 'en' ? english : arabic; }
function localCaptureTime(date = new Date()) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
function captureTimeIso(value = state.form.captureAt) {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.getTime()) ? date.toISOString() : null;
}
function resetAiRequests() {
  analysisSequence += 1; invoiceSequence += 1;
  analysisController?.abort(); invoiceController?.abort();
  invoiceReview = null; invoiceBusy = false; analysisBusy = false;
  const button = el('start-setup'); if (button) { button.disabled = false; button.innerHTML = ui('Ø¥Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ù†Ø¸Ø§Ù… <span>â†</span>', 'Set up system <span>â†</span>'); }
  const aiButton = el('analyze-panels'); if (aiButton) { aiButton.disabled = true; aiButton.textContent = ui('ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Claude', 'Panel assessment with Claude'); }
}
function analysisFingerprint() {
  return JSON.stringify({ accountId: currentAccount?.id, form: state.form, weather: { timezone: state.weather?.timezone, temperature: state.weather?.current?.temperature_2m, time: state.weather?.current?.time }, language: state.settings.language, media: mediaFor('panels').map(({ id, updatedAt }) => ({ id, updatedAt })) });
}
function claudeAvailabilityMarkup() {
  const message = claudeEnabled === true ? ui('Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Ai', 'Analysis with Ai') : claudeEnabled === false ? ui('Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Ai ØºÙŠØ± Ù…ÙØ¹Ù‘Ù„ Ø¨Ø¹Ø¯.', 'Ai analysis is not enabled yet.') : aiConfigurationChecked ? ui('ØªØ¹Ø°Ø± Ù…Ø¹Ø±ÙØ© Ø­Ø§Ù„Ø© Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… AiØ› Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.', 'Could not check Ai analysis availability; try again.') : ui('Ø¬Ø§Ø±Ù Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø®Ø¯Ù…Ø© Aiâ€¦', 'Checking Ai analysisâ€¦');
  return `<p class="ai-availability" role="status">${escapeHtml(message)}</p>`;
}
async function loadAiConfig() {
  try {
    const response = await fetch('/api/config');
    if (!response.ok) throw new Error('config');
    const config = await response.json();
    aiConfigurationChecked = true;
    claudeEnabled = !!config.claudeEnabled;
    complaintConfig = { email: config.complaintEmail || 'shathaalbaraa67@gmail.com', delivery: !!config.complaintEmailDelivery };
    document.querySelectorAll('.ai-availability').forEach((node) => { node.outerHTML = claudeAvailabilityMarkup(); });
    const billButton = el('analyze-invoice'); if (billButton) billButton.disabled = invoiceBusy || !claudeEnabled || !mediaFor('bill').length;
    const panelButton = el('analyze-panels'); if (panelButton) panelButton.disabled = analysisBusy || !claudeEnabled || !currentAccount?.id || !mediaFor('panels').length;
    return config;
  } catch { claudeEnabled = null; aiConfigurationChecked = true; document.querySelectorAll('.ai-availability').forEach((node) => { node.outerHTML = claudeAvailabilityMarkup(); }); return {}; }
}

function loadState(storageKey = STORAGE_KEY) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    return normalizeState(saved);
  } catch { return structuredClone(DEFAULT_STATE); }
}
function normalizeState(saved) {
  const normalized = saved ? { ...structuredClone(DEFAULT_STATE), ...saved, form: { ...DEFAULT_STATE.form, ...(saved.form || {}) }, settings: { ...DEFAULT_STATE.settings, ...(saved.settings || {}) }, history: saved.history || [] } : structuredClone(DEFAULT_STATE);
  if (normalized.ai && !Object.hasOwn(normalized.ai, 'dustCoveragePercent')) { normalized.ai = null; normalized.aiLanguage = null; normalized.aiModel = null; }
  normalized.weatherPrefill = { ...DEFAULT_STATE.weatherPrefill, ...(saved?.weatherPrefill || {}) };
  // Old panel-dust estimates must not become readings of airborne dust.
  if (saved && !Object.hasOwn(saved.form || {}, 'airDustPercent')) {
    normalized.form.airDustPercent = airborneDustReading(normalized.weather)?.percent ?? null;
    normalized.form.airDustManual = false;
  }
  return normalized;
}
function airborneDustReading(weather) {
  for (const source of ['dust', 'pm10']) {
    const raw = weather?.air?.[source];
    if ((typeof raw !== 'number' && typeof raw !== 'string') || String(raw).trim() === '') continue;
    const concentration = Number(raw);
    if (!Number.isFinite(concentration) || concentration < 0) continue;
    // A presentation index: 200 Âµg/mÂ³ maps to 100; this is not an air fraction or energy loss.
    return { source, concentration, percent: Math.min(100, Math.round(concentration / 2)) };
  }
  return null;
}
function weatherFieldWasFilled(key) {
  const marker = state.weatherPrefill?.[key];
  return !!marker && String(marker.value) === String(state.form[key])
    && String(marker.latitude) === String(state.form.latitude)
    && String(marker.longitude) === String(state.form.longitude)
    && Number.isFinite(Date.parse(marker.fetchedAt));
}
function weatherFieldCheck(key) {
  if (!Object.hasOwn(DEFAULT_STATE.weatherPrefill, key)) return '';
  return `<span class="weather-field-check" data-weather-check="${key}" role="img" aria-label="${ui('ØªÙ…Øª Ø§Ù„ØªØ¹Ø¨Ø¦Ø© Ù…Ù† Ø§Ù„Ø·Ù‚Ø³', 'Filled from weather data')}" title="${ui('ØªÙ…Øª Ø§Ù„ØªØ¹Ø¨Ø¦Ø© Ù…Ù† Ø§Ù„Ø·Ù‚Ø³', 'Filled from weather data')}" ${weatherFieldWasFilled(key) ? '' : 'hidden'}>âœ“</span>`;
}
function refreshWeatherFieldChecks() {
  document.querySelectorAll('[data-weather-check]').forEach((node) => { node.hidden = !weatherFieldWasFilled(node.dataset.weatherCheck); });
}
function clearWeatherForLocation() {
  state.weather = null; state.weatherPrefill = { ...DEFAULT_STATE.weatherPrefill };
  weatherNotice = null;
  if (!state.form.airDustManual) {
    state.form.airDustPercent = null;
    const input = el('field-airDustPercent');
    if (input) { input.value = '0'; input.setAttribute('aria-valuetext', ui('ØºÙŠØ± Ù…ØªØ§Ø­', 'Unavailable')); }
    const output = document.querySelector('[data-output="airDustPercent"]'); if (output) output.textContent = 'â€”';
  }
  const hint = el('air-dust-hint'); if (hint) hint.textContent = airDustHint();
  const condition = el('wizard-weather-condition'); if (condition) condition.textContent = ui('Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø·Ù‚Ø³', 'Waiting for weather data');
  refreshWeatherFieldChecks();
}
function airDustHint() {
  const explanation = ui('Ù…Ø¤Ø´Ø± Ù†Ø³Ø¨ÙŠ Ù…Ù† ØªØ±ÙƒÙŠØ² Ø§Ù„ØºØ¨Ø§Ø± ÙÙŠ Ø§Ù„Ø¬Ùˆ: 0â€“100%ØŒ ÙˆÙŠØµÙ„ Ø¥Ù„Ù‰ 100% Ø¹Ù†Ø¯ 200 Âµg/mÂ³. Ù„Ø§ ÙŠÙ…Ø«Ù„ ØªØ±Ø§ÙƒÙ… Ø§Ù„ØºØ¨Ø§Ø± Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø£Ùˆ Ø®Ø³Ø§Ø±Ø© Ø§Ù„Ø·Ø§Ù‚Ø©.', 'A relative airborne dust index: 0â€“100%, reaching 100% at 200 Âµg/mÂ³. It does not measure panel soiling or energy loss.');
  const reading = airborneDustReading(state.weather);
  const detail = state.form.airDustManual ? ui('Ù‚ÙŠÙ…Ø© Ù…Ø¹Ø¯Ù‘Ù„Ø© ÙŠØ¯ÙˆÙŠØ§Ù‹.', 'Manually adjusted value.') : reading ? `${reading.source === 'pm10' ? 'PM10' : ui('ØªØ±ÙƒÙŠØ² Ø§Ù„ØºØ¨Ø§Ø±', 'Dust concentration')}: ${reading.concentration.toFixed(1)} Âµg/mÂ³.` : ui('ØªØ¸Ù‡Ø± Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ø¹Ù†Ø¯ ØªÙˆÙØ± Ø¨ÙŠØ§Ù†Ø§Øª Ø¬ÙˆØ¯Ø© Ø§Ù„Ù‡ÙˆØ§Ø¡ Ù„Ù…ÙˆÙ‚Ø¹Ùƒ.', 'The reading appears when air quality data is available for your location.');
  return `${explanation} ${detail}`;
}
function clearVisualAssessment() { state.ai = null; state.aiLanguage = null; state.aiModel = null; }
async function authenticatedFetch(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  return fetch(url, { ...options, headers, credentials: 'same-origin' });
}
function accountStorageKey(accountId = currentAccount?.id) {
  return accountId ? `${STORAGE_KEY}.account.${accountId}` : `${STORAGE_KEY}.guest`;
}
function persist() {
  localStorage.setItem(accountStorageKey(), JSON.stringify({ ...state, user: null }));
  applyTheme();
  syncHeader();
  if (currentAccount) {
    clearTimeout(panelSyncTimer);
    panelSyncTimer = setTimeout(() => syncPanelData().catch(() => {}), 650);
    clearTimeout(accountSyncTimer);
    accountSyncTimer = setTimeout(() => syncAccountState().catch(() => {}), 650);
  }
}
async function syncAccountState() {
  if (!currentAccount?.id) return;
  const response = await authenticatedFetch('/api/account/state', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: { ...state, user: null } }),
  });
  if (!response.ok) throw new Error((await response.json()).error || 'ØªØ¹Ø°Ø± Ù…Ø²Ø§Ù…Ù†Ø© Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø¨.');
}
async function syncPanelData() {
  if (!currentAccount?.id) return;
  const response = await authenticatedFetch('/api/panel/sync', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      onboarded: !!state.onboarded, location: state.form.location, latitude: state.form.latitude, longitude: state.form.longitude,
      timezone: state.weather?.timezone || '', tilt: state.form.tilt, notifications: !!state.settings.notifications, lastCleanedAt: state.lastCleanedAt,
    }),
  });
  if (!response.ok) throw new Error((await response.json()).error || 'ØªØ¹Ø°Ø± Ù…Ø²Ø§Ù…Ù†Ø© Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù….');
}

async function loadAppSettings() {
  try {
    const response = await fetch('/api/app-settings');
    if (!response.ok) return;
    appSettings = await response.json();
    if (!el('page-wizard').hidden && currentStep === 1) renderCurrentStep();
    if (!el('page-settings').hidden) renderSettings();
  } catch { appSettings = null; }
}

function tiltWarningMarkup() {
  const value = state.form.tilt;
  if (!appSettings || value === '' || value === null || value === undefined) return '';
  const tilt = Number(value);
  const min = Number(appSettings.tilt_min_degrees);
  const max = Number(appSettings.tilt_max_degrees);
  if (!Number.isFinite(tilt) || tilt >= min && tilt <= max || String(value) === String(state.tiltWarningSeenFor ?? '')) return '';
  const target = Number(appSettings.tilt_target_degrees);
  const message = state.settings.language === 'en'
    ? `Your current panel tilt may collect dust faster than an angle close to ${target} degrees.`
    : `Ø²Ø§ÙˆÙŠØ© Ù„ÙˆØ­Ùƒ Ø§Ù„Ø­Ø§Ù„ÙŠØ© ØªØ®Ù„ÙŠÙ‡ ÙŠØªØ¬Ù…Ø¹ Ø¹Ù„ÙŠÙ‡ ØºØ¨Ø§Ø± Ø£Ø³Ø±Ø¹ Ù…Ù† Ù„Ùˆ ÙƒØ§Ù†Øª Ù‚Ø±ÙŠØ¨Ø© Ù…Ù† ${target} Ø¯Ø±Ø¬Ø©.`;
  return `<div class="tilt-warning" role="status">${message}</div>`;
}

// --- Animated 3D-style panel scene: sun, light and dust build-up ---
const PANEL_VISUAL_FALLBACK_TARGET = 30;
const PANEL_SCENE = {
  width: 150, length: 110, thickness: 6, hingeHeight: 16, frameWidth: 7,
  columns: 6, rows: 9, yaw: 26, pitch: 13, distance: 900, scale: 1.0, cx: 156, cy: 148,
  sunX: 306, sunY: 38,
};
const PANEL_SCENE_VIEW = (() => {
  const yaw = PANEL_SCENE.yaw * Math.PI / 180;
  const pitch = PANEL_SCENE.pitch * Math.PI / 180;
  return { cosYaw: Math.cos(yaw), sinYaw: Math.sin(yaw), cosPitch: Math.cos(pitch), sinPitch: Math.sin(pitch) };
})();
const PANEL_SCENE_SPECKS = [
  [0.10, 0.16, 1.4], [0.24, 0.38, 1.9], [0.38, 0.12, 1.3], [0.52, 0.46, 2.1],
  [0.66, 0.24, 1.6], [0.78, 0.58, 1.8], [0.90, 0.34, 1.4], [0.16, 0.68, 1.7],
  [0.34, 0.84, 1.5], [0.58, 0.72, 1.9], [0.72, 0.88, 1.6], [0.86, 0.78, 1.4],
  [0.44, 0.28, 1.2], [0.28, 0.56, 1.3],
];

function formatTiltDegrees(value) {
  const rounded = Math.round(Number(value) * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
function panelVisualTiltIsPlaceholder() {
  const raw = state.form.tilt;
  return raw === '' || raw === null || raw === undefined || !Number.isFinite(Number(raw));
}
function panelVisualTilt() {
  if (!panelVisualTiltIsPlaceholder()) return Math.min(90, Math.max(0, Number(state.form.tilt)));
  const target = Number(appSettings?.tilt_target_degrees);
  return Number.isFinite(target) ? Math.min(90, Math.max(0, target)) : PANEL_VISUAL_FALLBACK_TARGET;
}
function panelVisualDustFactor(tilt) {
  const flatness = 1 - Math.min(90, Math.max(0, tilt)) / 90;
  return Math.pow(flatness, 1.5);
}
function panelProject(x, y, z) {
  const view = PANEL_SCENE_VIEW;
  const x1 = x * view.cosYaw + z * view.sinYaw;
  const z1 = -x * view.sinYaw + z * view.cosYaw;
  const screenY = -y * view.cosPitch + z1 * view.sinPitch;
  const depth = y * view.sinPitch + z1 * view.cosPitch;
  const factor = PANEL_SCENE.distance / Math.max(260, PANEL_SCENE.distance - depth);
  return [
    PANEL_SCENE.cx + x1 * factor * PANEL_SCENE.scale,
    PANEL_SCENE.cy + screenY * factor * PANEL_SCENE.scale,
  ];
}
function panelPath(points) {
  return points.map((point, index) => `${index ? 'L' : 'M'}${point[0].toFixed(1)} ${point[1].toFixed(1)}`).join('') + 'Z';
}
function panelLine(from, to) {
  return `x1="${from[0].toFixed(1)}" y1="${from[1].toFixed(1)}" x2="${to[0].toFixed(1)}" y2="${to[1].toFixed(1)}"`;
}
function panelSceneGeometry(tilt) {
  const radians = tilt * Math.PI / 180;
  const sinT = Math.sin(radians);
  const cosT = Math.cos(radians);
  const half = PANEL_SCENE.width / 2;
  const baseY = PANEL_SCENE.hingeHeight;
  const length = PANEL_SCENE.length;
  const thickness = PANEL_SCENE.thickness;
  const frame = PANEL_SCENE.frameWidth;

  const freeY = baseY + length * sinT;
  const freeZ = -length * cosT;
  const normalY = cosT;
  const normalZ = sinT;

  const top = [[-half, baseY, 0], [half, baseY, 0], [half, freeY, freeZ], [-half, freeY, freeZ]];
  const bottom = top.map(([x, y, z]) => [x, y - thickness * normalY, z - thickness * normalZ]);

  const glassHingeY = baseY + frame * sinT;
  const glassHingeZ = -frame * cosT;
  const glassFreeY = freeY - frame * sinT;
  const glassFreeZ = freeZ + frame * cosT;
  const glassHalf = half - frame;
  const glass = [
    [-glassHalf, glassHingeY, glassHingeZ], [glassHalf, glassHingeY, glassHingeZ],
    [glassHalf, glassFreeY, glassFreeZ], [-glassHalf, glassFreeY, glassFreeZ],
  ];

  const cells = [];
  for (let column = 1; column < PANEL_SCENE.columns; column += 1) {
    const x = -glassHalf + (2 * glassHalf * column) / PANEL_SCENE.columns;
    cells.push([panelProject(x, glassHingeY, glassHingeZ), panelProject(x, glassFreeY, glassFreeZ)]);
  }
  for (let row = 1; row < PANEL_SCENE.rows; row += 1) {
    const ratio = row / PANEL_SCENE.rows;
    const y = glassHingeY + (glassFreeY - glassHingeY) * ratio;
    const z = glassHingeZ + (glassFreeZ - glassHingeZ) * ratio;
    cells.push([panelProject(-glassHalf, y, z), panelProject(glassHalf, y, z)]);
  }

  const specks = PANEL_SCENE_SPECKS.map(([u, v, radius]) => {
    const y = glassHingeY + (glassFreeY - glassHingeY) * v;
    const z = glassHingeZ + (glassFreeZ - glassHingeZ) * v;
    const point = panelProject(-glassHalf + 2 * glassHalf * u, y, z);
    return [point[0], point[1], radius];
  });

  const shadow = top.map(([x, y, z]) => panelProject(x - 18 - 0.5 * y, 0, z + 14 + 0.3 * y));

  const attachRatio = 0.62;
  const attachY = glassHingeY + (glassFreeY - glassHingeY) * attachRatio - thickness * normalY;
  const attachZ = glassHingeZ + (glassFreeZ - glassHingeZ) * attachRatio - thickness * normalZ;
  const strutTop = panelProject(0, attachY, attachZ);
  const strutBase = panelProject(0, 0, attachZ - 26);

  const topPoints = top.map(([x, y, z]) => panelProject(x, y, z));
  const bottomPoints = bottom.map(([x, y, z]) => panelProject(x, y, z));
  const glassPoints = glass.map(([x, y, z]) => panelProject(x, y, z));

  const specular = panelProject(
    -glassHalf + 2 * glassHalf * 0.76,
    glassHingeY + (glassFreeY - glassHingeY) * 0.3,
    glassHingeZ + (glassFreeZ - glassHingeZ) * 0.3,
  );

  const silhouette = topPoints.concat(bottomPoints);
  const bounds = {
    minX: Math.min(...silhouette.map((point) => point[0])),
    maxX: Math.max(...silhouette.map((point) => point[0])),
    minY: Math.min(...silhouette.map((point) => point[1])),
    maxY: Math.max(...silhouette.map((point) => point[1])),
  };

  return {
    top: topPoints,
    bottom: bottomPoints,
    glass: glassPoints,
    topPath: panelPath(topPoints),
    bottomPath: panelPath(bottomPoints),
    glassPath: panelPath(glassPoints),
    leftFacePath: panelPath([bottomPoints[0], topPoints[0], topPoints[3], bottomPoints[3]]),
    rightFacePath: panelPath([bottomPoints[1], bottomPoints[2], topPoints[2], topPoints[1]]),
    frontFacePath: panelPath([bottomPoints[0], bottomPoints[1], topPoints[1], topPoints[0]]),
    shadowPath: panelPath(shadow),
    cells,
    specks,
    strutTop,
    strutBase,
    specular,
    bounds,
    center: [
      (topPoints[0][0] + topPoints[1][0] + topPoints[2][0] + topPoints[3][0]) / 4,
      (topPoints[0][1] + topPoints[1][1] + topPoints[2][1] + topPoints[3][1]) / 4,
    ],
  };
}
function panelVisualRayPaths(tilt) {
  const geometry = panelSceneGeometry(tilt);
  const { sunX, sunY } = PANEL_SCENE;
  const [midX, midY] = geometry.center;
  const dx = midX - sunX;
  const dy = midY - sunY;
  const distance = Math.hypot(dx, dy) || 1;
  const ux = dx / distance;
  const uy = dy / distance;
  const px = -uy;
  const py = ux;
  const { bounds } = geometry;
  const hitsPanel = (x, y) => x >= bounds.minX - 3 && x <= bounds.maxX + 3 && y >= bounds.minY - 3 && y <= bounds.maxY + 3;
  return [-18, 0, 18].map((offset) => {
    const startX = sunX + ux * 26 + px * offset;
    const startY = sunY + uy * 26 + py * offset;
    let endX = sunX + ux * (distance - 24) + px * offset;
    let endY = sunY + uy * (distance - 24) + py * offset;
    for (let step = 26; step <= distance; step += 2) {
      const x = sunX + ux * step + px * offset;
      const y = sunY + uy * step + py * offset;
      if (hitsPanel(x, y)) {
        endX = x - ux * 9;
        endY = y - uy * 9;
        break;
      }
    }
    return `M ${startX.toFixed(1)} ${startY.toFixed(1)} L ${endX.toFixed(1)} ${endY.toFixed(1)}`;
  });
}
function panelVisualMessage(tilt) {
  const english = state.settings.language === 'en';
  const low = Number.isFinite(Number(appSettings?.tilt_min_degrees)) ? Number(appSettings.tilt_min_degrees) : 25;
  const high = Number.isFinite(Number(appSettings?.tilt_max_degrees)) ? Number(appSettings.tilt_max_degrees) : 35;
  const suggested = Number.isFinite(Number(appSettings?.tilt_target_degrees)) ? Number(appSettings.tilt_target_degrees) : PANEL_VISUAL_FALLBACK_TARGET;
  const shown = formatTiltDegrees(tilt);
  const target = formatTiltDegrees(suggested);
  if (panelVisualTiltIsPlaceholder()) {
    return {
      tone: 'neutral',
      headline: english ? `Suggested angle: ${target}Â°` : `Ø§Ù„Ø²Ø§ÙˆÙŠØ© Ø§Ù„Ù…Ù‚ØªØ±Ø­Ø©: ${target}Â°`,
      detail: english ? 'Enter the panel tilt above to preview how dust builds up on the glass.' : 'Ø£Ø¯Ø®Ù„ Ù…ÙŠÙ„ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø£Ø¹Ù„Ø§Ù‡ Ù„ØªØ±Ù‰ ÙƒÙŠÙ ÙŠØªØºÙŠÙ‘Ø± ØªØ±Ø§ÙƒÙ… Ø§Ù„ØºØ¨Ø§Ø± Ø¹Ù„Ù‰ Ø§Ù„Ù„ÙˆØ­.',
    };
  }
  if (tilt < low) {
    return {
      tone: 'warn',
      headline: english ? `We suggest raising the tilt to about ${target}Â°` : `Ù†Ù‚ØªØ±Ø­ Ø±ÙØ¹ Ø§Ù„Ù…ÙŠÙ„ Ø¥Ù„Ù‰ ${target}Â° ØªÙ‚Ø±ÙŠØ¨Ø§Ù‹`,
      detail: english ? `At ${shown}Â° the panel is almost flat, so dust settles faster and blocks the sun.` : `Ø¹Ù†Ø¯ ${shown}Â° ÙŠÙƒÙˆÙ† Ø§Ù„Ù„ÙˆØ­ Ø´Ø¨Ù‡ Ø£ÙÙ‚ÙŠØŒ ÙÙŠØªØ±Ø§ÙƒÙ… Ø§Ù„ØºØ¨Ø§Ø± Ø£Ø³Ø±Ø¹ ÙˆÙŠØ­Ø¬Ø¨ Ø¶ÙˆØ¡ Ø§Ù„Ø´Ù…Ø³.`,
    };
  }
  if (tilt > high) {
    return {
      tone: 'warn',
      headline: english ? `We suggest lowering the tilt to about ${target}Â°` : `Ù†Ù‚ØªØ±Ø­ Ø®ÙØ¶ Ø§Ù„Ù…ÙŠÙ„ Ø¥Ù„Ù‰ ${target}Â° ØªÙ‚Ø±ÙŠØ¨Ø§Ù‹`,
      detail: english ? `At ${shown}Â° the panel is steeper than the recommended ${formatTiltDegrees(low)}Â°â€“${formatTiltDegrees(high)}Â° range.` : `Ø¹Ù†Ø¯ ${shown}Â° ÙŠÙƒÙˆÙ† Ø§Ù„Ù„ÙˆØ­ Ø£ÙƒØ«Ø± Ø§Ù†Ø­Ø¯Ø§Ø±Ø§Ù‹ Ù…Ù† Ø§Ù„Ù…Ø¯Ù‰ Ø§Ù„Ù…ÙˆØµÙ‰ Ø¨Ù‡ (${formatTiltDegrees(low)}Â°â€“${formatTiltDegrees(high)}Â°).`,
    };
  }
  return {
    tone: 'good',
    headline: english ? `Your ${shown}Â° tilt is within the recommended range` : `Ø²Ø§ÙˆÙŠØªÙƒ ${shown}Â° Ø¶Ù…Ù† Ø§Ù„Ù…Ø¯Ù‰ Ø§Ù„Ù…ÙˆØµÙ‰ Ø¨Ù‡`,
    detail: english ? `Keep it between ${formatTiltDegrees(low)}Â° and ${formatTiltDegrees(high)}Â°: the steeper the panel, the less dust it collects.` : `Ø£Ø¨Ù‚Ù Ø§Ù„Ù„ÙˆØ­ Ø¨ÙŠÙ† ${formatTiltDegrees(low)}Â° Ùˆ${formatTiltDegrees(high)}Â°: ÙƒÙ„Ù…Ø§ Ø§Ø±ØªÙØ¹ Ø§Ù„Ù…ÙŠÙ„ Ù‚Ù„Ù‘ ØªØ±Ø§ÙƒÙ… Ø§Ù„ØºØ¨Ø§Ø±.`,
  };
}
function panelCellsMarkup(geometry) {
  return geometry.cells.map(([from, to]) => `<line ${panelLine(from, to)}></line>`).join('');
}
function panelSpecksMarkup(geometry) {
  return geometry.specks.map(([x, y, radius]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius}"></circle>`).join('');
}
function panelTiltVisualMarkup() {
  const tilt = panelVisualTilt();
  const dust = panelVisualDustFactor(tilt);
  const geometry = panelSceneGeometry(tilt);
  const rays = panelVisualRayPaths(tilt);
  const message = panelVisualMessage(tilt);
  const angle = formatTiltDegrees(tilt);
  const half = PANEL_SCENE.width / 2;
  const pebbles = [[-70, -30, 5, 2.4], [46, -46, 4, 2], [-96, 12, 6, 2.8], [72, 26, 5, 2.2], [10, 52, 4, 1.9], [-34, 74, 6, 2.6], [118, -8, 4, 1.8], [96, 66, 5, 2.2]]
    .map(([x, z, rx, ry]) => {
      const point = panelProject(x, 0, z);
      return `<ellipse class="pv-pebble" cx="${point[0].toFixed(1)}" cy="${point[1].toFixed(1)}" rx="${rx}" ry="${ry}"></ellipse>`;
    }).join('');
  const posts = [-1, 1].map((side) => {
    const x = side * half * 0.82;
    const base = panelProject(x, 0, 0);
    const top = panelProject(x, PANEL_SCENE.hingeHeight, 0);
    return `<g class="pv-post"><ellipse class="pv-post-foot" cx="${base[0].toFixed(1)}" cy="${base[1].toFixed(1)}" rx="7" ry="2.6"></ellipse><line ${panelLine(base, top)}></line></g>`;
  }).join('');
  const motes = [[86, 96, 1.6], [120, 74, 1.3], [252, 96, 1.8], [286, 120, 1.4], [206, 132, 1.5], [156, 150, 1.7], [320, 158, 1.5], [60, 140, 1.4]]
    .map(([cx, cy, r], index) => `<circle class="pv-dust-mote pv-dust-mote-${index + 1}" cx="${cx}" cy="${cy}" r="${r}"></circle>`).join('');
  return `<figure class="panel-visual" id="panel-visual" data-lang="${state.settings.language === 'en' ? 'en' : 'ar'}">
    <div class="panel-visual-stage">
      <svg class="panel-visual-svg" viewBox="0 0 360 240" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="pvSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7cb0da"></stop><stop offset="52%" stop-color="#c3dce9"></stop><stop offset="100%" stop-color="#f5ecd9"></stop></linearGradient>
          <radialGradient id="pvSun" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fffdf0"></stop><stop offset="55%" stop-color="#ffe08a"></stop><stop offset="100%" stop-color="#ffb347"></stop></radialGradient>
          <radialGradient id="pvSpec" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffffff" stop-opacity=".44"></stop><stop offset="40%" stop-color="#ffeec4" stop-opacity=".15"></stop><stop offset="100%" stop-color="#ffffff" stop-opacity="0"></stop></radialGradient>
          <linearGradient id="pvGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d9c8a6"></stop><stop offset="55%" stop-color="#c9b48d"></stop><stop offset="100%" stop-color="#b39c74"></stop></linearGradient>
          <linearGradient id="pvFrame" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#eef2f6"></stop><stop offset="45%" stop-color="#c7d0d9"></stop><stop offset="100%" stop-color="#9aa5b0"></stop></linearGradient>
          <linearGradient id="pvMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#dbe2e9"></stop><stop offset="50%" stop-color="#aab4be"></stop><stop offset="100%" stop-color="#8b959f"></stop></linearGradient>
          <linearGradient id="pvGlass" x1="0" y1="0" x2="0.8" y2="1"><stop offset="0%" stop-color="#2c5f8d"></stop><stop offset="45%" stop-color="#1c3c5c"></stop><stop offset="100%" stop-color="#27566f"></stop></linearGradient>
          <linearGradient id="pvSheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffffff" stop-opacity="0"></stop><stop offset="34%" stop-color="#ffffff" stop-opacity=".34"></stop><stop offset="48%" stop-color="#ffffff" stop-opacity=".05"></stop><stop offset="100%" stop-color="#ffffff" stop-opacity="0"></stop></linearGradient>
          <linearGradient id="pvRay" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffd98a" stop-opacity=".05"></stop><stop offset="100%" stop-color="#f5a63c" stop-opacity=".85"></stop></linearGradient>
          <clipPath id="pvGlassClip"><path id="pv-glass-clip-path" d="${geometry.glassPath}"></path></clipPath>
          <filter id="pvSoftBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3.4"></feGaussianBlur></filter>
          <filter id="pvShadowBlur" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="7"></feGaussianBlur></filter>
          <filter id="pvDustTexture" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.62 0.94" numOctaves="3" seed="11"></feTurbulence><feColorMatrix type="matrix" values="0 0 0 0 0.60  0 0 0 0 0.47  0 0 0 0 0.28  0 0 0 0.95 0"></feColorMatrix></filter>
          <filter id="pvGroundGrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="4"></feTurbulence><feColorMatrix type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.34  0 0 0 0 0.24  0 0 0 0.5 0"></feColorMatrix></filter>
          <marker id="pvArrowHead" markerWidth="6" markerHeight="6" refX="4.4" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#f0a24a"></path></marker>
        </defs>
        <rect x="0" y="0" width="360" height="240" fill="url(#pvSky)"></rect>
        <circle class="pv-sun-glow" cx="${PANEL_SCENE.sunX}" cy="${PANEL_SCENE.sunY}" r="46"></circle>
        <circle class="pv-sun-core" cx="${PANEL_SCENE.sunX}" cy="${PANEL_SCENE.sunY}" r="17" fill="url(#pvSun)"></circle>
        <ellipse class="pv-cloud" cx="74" cy="54" rx="48" ry="11" filter="url(#pvSoftBlur)"></ellipse>
        <ellipse class="pv-cloud" cx="112" cy="45" rx="30" ry="8" filter="url(#pvSoftBlur)"></ellipse>
        <ellipse class="pv-cloud pv-cloud-far" cx="228" cy="66" rx="40" ry="8" filter="url(#pvSoftBlur)"></ellipse>
        <path class="pv-hills" d="M0 88 C 44 74 78 84 120 78 C 164 71 198 84 246 77 C 290 71 324 82 360 76 L360 110 L0 110 Z" filter="url(#pvSoftBlur)"></path>
        <rect class="pv-ground" x="0" y="94" width="360" height="146" fill="url(#pvGround)"></rect>
        <rect class="pv-ground-grain" x="0" y="94" width="360" height="146" filter="url(#pvGroundGrain)" opacity=".55"></rect>
        ${pebbles}
        <path class="pv-shadow" id="panel-shadow" d="${geometry.shadowPath}" filter="url(#pvShadowBlur)"></path>
        <g class="pv-strut">
          <ellipse class="pv-strut-foot" id="panel-strut-foot" cx="${geometry.strutBase[0].toFixed(1)}" cy="${geometry.strutBase[1].toFixed(1)}" rx="6" ry="2.2"></ellipse>
          <line id="panel-strut" ${panelLine(geometry.strutBase, geometry.strutTop)}></line>
        </g>
        <path class="pv-panel-bottom" id="panel-bottom" d="${geometry.bottomPath}"></path>
        <path class="pv-panel-face" id="panel-face-right" d="${geometry.rightFacePath}"></path>
        <path class="pv-panel-face" id="panel-face-left" d="${geometry.leftFacePath}"></path>
        <path class="pv-panel-face pv-panel-face-front" id="panel-face-front" d="${geometry.frontFacePath}"></path>
        <path class="pv-panel-top" id="panel-top" d="${geometry.topPath}" fill="url(#pvFrame)"></path>
        <path class="pv-panel-glass" id="panel-glass" d="${geometry.glassPath}" fill="url(#pvGlass)"></path>
        <g clip-path="url(#pvGlassClip)">
          <g class="pv-cells" id="panel-cells">${panelCellsMarkup(geometry)}</g>
          <rect id="panel-dust" x="0" y="0" width="360" height="240" filter="url(#pvDustTexture)" opacity="${(dust * 0.55).toFixed(3)}"></rect>
          <g class="pv-specks" id="panel-dust-specks" opacity="${(dust * 0.9).toFixed(3)}">${panelSpecksMarkup(geometry)}</g>
          <circle class="pv-glass-spec" id="panel-glass-spec" cx="${geometry.specular[0].toFixed(1)}" cy="${geometry.specular[1].toFixed(1)}" r="30" fill="url(#pvSpec)"></circle>
          <rect class="pv-sheen" x="-80" y="-60" width="520" height="360" fill="url(#pvSheen)"></rect>
        </g>
        ${posts}
        <g class="pv-rays" fill="none" stroke="url(#pvRay)" stroke-width="2.2" stroke-linecap="round" marker-end="url(#pvArrowHead)">
          <path class="pv-ray pv-ray-1" id="panel-ray-1" d="${rays[0]}" stroke-dasharray="6 8"></path>
          <path class="pv-ray pv-ray-2" id="panel-ray-2" d="${rays[1]}" stroke-dasharray="6 8"></path>
          <path class="pv-ray pv-ray-3" id="panel-ray-3" d="${rays[2]}" stroke-dasharray="6 8"></path>
        </g>
        <g class="pv-dust-motes" id="panel-dust-motes" opacity="${(0.15 + dust * 0.5).toFixed(3)}">${motes}</g>
      </svg>
      <span class="panel-visual-angle"><b id="panel-angle-value">${angle}Â°</b><small>${ui('Ù…ÙŠÙ„ Ø§Ù„Ù„ÙˆØ­', 'Panel tilt')}</small></span>
    </div>
    <figcaption class="panel-visual-note is-${message.tone}" id="panel-visual-note" aria-live="polite">
      <strong>${escapeHtml(message.headline)}</strong>
      <span>${escapeHtml(message.detail)}</span>
    </figcaption>
  </figure>`;
}
function updatePanelVisual() {
  const figure = el('panel-visual');
  if (!figure) return;
  const tilt = panelVisualTilt();
  const dust = panelVisualDustFactor(tilt);
  const geometry = panelSceneGeometry(tilt);
  const set = (id, attributes) => {
    const node = el(id);
    if (!node) return;
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
  };
  figure.dataset.tilt = String(tilt);
  set('panel-shadow', { d: geometry.shadowPath });
  set('panel-bottom', { d: geometry.bottomPath });
  set('panel-face-right', { d: geometry.rightFacePath });
  set('panel-face-left', { d: geometry.leftFacePath });
  set('panel-face-front', { d: geometry.frontFacePath });
  set('panel-top', { d: geometry.topPath });
  set('panel-glass', { d: geometry.glassPath });
  set('pv-glass-clip-path', { d: geometry.glassPath });
  set('panel-strut', {
    x1: geometry.strutBase[0].toFixed(1), y1: geometry.strutBase[1].toFixed(1),
    x2: geometry.strutTop[0].toFixed(1), y2: geometry.strutTop[1].toFixed(1),
  });
  set('panel-strut-foot', { cx: geometry.strutBase[0].toFixed(1), cy: geometry.strutBase[1].toFixed(1) });
  set('panel-dust', { opacity: (dust * 0.55).toFixed(3) });
  set('panel-dust-motes', { opacity: (0.15 + dust * 0.5).toFixed(3) });
  set('panel-glass-spec', {
    cx: geometry.specular[0].toFixed(1),
    cy: geometry.specular[1].toFixed(1),
  });
  const cells = el('panel-cells');
  if (cells) cells.innerHTML = panelCellsMarkup(geometry);
  const specks = el('panel-dust-specks');
  if (specks) {
    specks.innerHTML = panelSpecksMarkup(geometry);
    specks.setAttribute('opacity', (dust * 0.9).toFixed(3));
  }
  panelVisualRayPaths(tilt).forEach((path, index) => el(`panel-ray-${index + 1}`)?.setAttribute('d', path));
  const angleValue = el('panel-angle-value');
  if (angleValue) angleValue.textContent = `${formatTiltDegrees(tilt)}Â°`;
  const note = el('panel-visual-note');
  if (note) {
    const message = panelVisualMessage(tilt);
    note.className = `panel-visual-note is-${message.tone}`;
    note.innerHTML = `<strong>${escapeHtml(message.headline)}</strong><span>${escapeHtml(message.detail)}</span>`;
  }
}
function renderPanelVisual() {
  const mount = el('panel-visual-mount');
  if (!mount) return;
  const language = state.settings.language === 'en' ? 'en' : 'ar';
  const figure = el('panel-visual');
  if (!figure || figure.dataset.lang !== language) mount.innerHTML = panelTiltVisualMarkup();
  else updatePanelVisual();
}

// --- Panel maintenance cycle (every 6 months) ---
const MAINTENANCE_CYCLE_MONTHS = 6;
const MAINTENANCE_CYCLE_DAYS = 183;
const DAY_MS = 24 * 60 * 60 * 1000;

function todayIsoDate(reference = new Date()) {
  return `${reference.getFullYear()}-${String(reference.getMonth() + 1).padStart(2, '0')}-${String(reference.getDate()).padStart(2, '0')}`;
}
function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? '').trim());
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}
function addMonthsClamped(date, months) {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
}
function arabicCount(count, forms) {
  const n = Math.abs(Number(count) || 0);
  if (n === 1) return forms.one;
  if (n === 2) return forms.two;
  if (n >= 3 && n <= 10) return `${n} ${forms.few}`;
  return `${n} ${forms.many}`;
}
function maintenanceStatus(reference = new Date()) {
  const last = parseIsoDate(state.form.lastMaintenanceAt);
  if (!last) return null;
  const start = new Date(last.getFullYear(), last.getMonth(), last.getDate());
  const today = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  if (start > today) return null;
  const elapsedDays = Math.max(0, Math.round((today - start) / DAY_MS));
  let months = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());
  let anchor = addMonthsClamped(start, months);
  if (anchor > today) { months -= 1; anchor = addMonthsClamped(start, months); }
  const daysAfterMonths = Math.max(0, Math.round((today - anchor) / DAY_MS));
  const due = addMonthsClamped(start, MAINTENANCE_CYCLE_MONTHS);
  const daysRemaining = Math.round((due - today) / DAY_MS);
  let monthsUntilDue = (due.getFullYear() - today.getFullYear()) * 12 + (due.getMonth() - today.getMonth());
  if (addMonthsClamped(today, monthsUntilDue) > due) monthsUntilDue -= 1;
  monthsUntilDue = Math.max(0, monthsUntilDue);
  return {
    last: start, due, elapsedDays, months, days: daysAfterMonths, daysRemaining, monthsUntilDue,
    overdue: daysRemaining < 0, dueSoon: daysRemaining >= 0 && daysRemaining <= 14,
    progressPercent: Math.min(100, Math.round((Math.min(elapsedDays, MAINTENANCE_CYCLE_DAYS) / MAINTENANCE_CYCLE_DAYS) * 100)),
  };
}
function maintenanceDateLabel(date, locale) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return 'â€”';
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}
function maintenanceElapsedLabel(status) {
  const english = state.settings.language === 'en';
  if (status.elapsedDays === 0) return english ? 'today' : 'Ø§Ù„ÙŠÙˆÙ…';
  const parts = [];
  if (status.months > 0) parts.push(english ? `${status.months} ${status.months === 1 ? 'month' : 'months'}` : arabicCount(status.months, { one: 'Ø´Ù‡Ø± ÙˆØ§Ø­Ø¯', two: 'Ø´Ù‡Ø±ÙŠÙ†', few: 'Ø£Ø´Ù‡Ø±', many: 'Ø´Ù‡Ø±Ù‹Ø§' }));
  if (status.days > 0 || !parts.length) parts.push(english ? `${status.days} ${status.days === 1 ? 'day' : 'days'}` : arabicCount(status.days, { one: 'ÙŠÙˆÙ… ÙˆØ§Ø­Ø¯', two: 'ÙŠÙˆÙ…ÙŠÙ†', few: 'Ø£ÙŠØ§Ù…', many: 'ÙŠÙˆÙ…Ù‹Ø§' }));
  return (english ? 'since ' : 'Ù‚Ø¨Ù„ ') + parts.join(english ? ' and ' : ' Ùˆ');
}
function maintenanceRemainingLabel(status) {
  const english = state.settings.language === 'en';
  const count = Math.abs(status.daysRemaining);
  if (status.daysRemaining === 0) return english ? 'Maintenance is due today.' : 'Ø§Ù„ØµÙŠØ§Ù†Ø© Ù…Ø³ØªØ­Ù‚Ø© Ø§Ù„ÙŠÙˆÙ….';
  if (status.overdue) {
    return english ? `Maintenance is ${count} ${count === 1 ? 'day' : 'days'} overdue.` : `ØªØ£Ø®Ø±Øª Ø§Ù„ØµÙŠØ§Ù†Ø© ${arabicCount(count, { one: 'ÙŠÙˆÙ…Ù‹Ø§ ÙˆØ§Ø­Ø¯Ù‹Ø§', two: 'ÙŠÙˆÙ…ÙŠÙ†', few: 'Ø£ÙŠØ§Ù…', many: 'ÙŠÙˆÙ…Ù‹Ø§' })}.`;
  }
  return english ? `${count} ${count === 1 ? 'day' : 'days'} left until the next maintenance.` : `Ø¨Ø§Ù‚ÙŠ ${arabicCount(count, { one: 'ÙŠÙˆÙ… ÙˆØ§Ø­Ø¯', two: 'ÙŠÙˆÙ…ÙŠÙ†', few: 'Ø£ÙŠØ§Ù…', many: 'ÙŠÙˆÙ…Ù‹Ø§' })} Ø¹Ù„Ù‰ Ø§Ù„ØµÙŠØ§Ù†Ø© Ø§Ù„Ù‚Ø§Ø¯Ù…Ø©.`;
}
function maintenancePillMarkup(status) {
  const english = state.settings.language === 'en';
  if (!status) return { hidden: true, className: '', text: '' };
  if (status.overdue) return { hidden: false, className: 'is-overdue', text: english ? 'Overdue' : 'Ù…ØªØ£Ø®Ø±Ø©' };
  if (status.dueSoon) return { hidden: false, className: 'is-due-soon', text: english ? 'Due soon' : 'Ù‚Ø±ÙŠØ¨Ø©' };
  return { hidden: false, className: 'is-ok', text: english ? 'On schedule' : 'Ù…Ù†ØªØ¸Ù…Ø©' };
}
function renderMaintenance() {
  const container = el('maintenance-content');
  if (!container) return;
  const english = state.settings.language === 'en';
  const locale = english ? 'en-OM' : 'ar-OM';
  const status = maintenanceStatus();
  const button = el('maintenance-done');
  const pill = el('maintenance-state-pill');
  const panel = el('maintenance-panel');
  if (button) { button.disabled = false; button.textContent = english ? 'Mark maintenance done today âœ“' : 'ØªÙ…Øª Ø§Ù„ØµÙŠØ§Ù†Ø© Ø§Ù„ÙŠÙˆÙ… âœ“'; }
  const pillState = maintenancePillMarkup(status);
  if (pill) {
    pill.hidden = pillState.hidden;
    pill.className = `maintenance-pill ${pillState.className}`.trim();
    const label = pill.querySelector('span'); if (label) label.textContent = pillState.text;
  }
  if (panel) {
    panel.classList.toggle('maintenance-empty', !status);
    panel.classList.toggle('maintenance-overdue', Boolean(status?.overdue));
    panel.classList.toggle('maintenance-due-soon', Boolean(status?.dueSoon && !status?.overdue));
  }
  if (!status) {
    container.innerHTML = `<div class="maintenance-empty-state"><div class="maintenance-empty-icon">ðŸ“…</div><p>${english ? 'No maintenance date is saved yet. Add the date of your last maintenance in the system details so we can schedule the next one and count the days for you.' : 'Ù„Ù… ÙŠÙØ³Ø¬ÙŽÙ‘Ù„ ØªØ§Ø±ÙŠØ® Ø¢Ø®Ø± ØµÙŠØ§Ù†Ø© Ø¨Ø¹Ø¯. Ø£Ø¶Ù ØªØ§Ø±ÙŠØ® Ø¢Ø®Ø± ØµÙŠØ§Ù†Ø© Ù…Ù† Â«ØªØ­Ø¯ÙŠØ« Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù…Â» Ù„Ù†Ø­Ø³Ø¨ Ù„Ùƒ Ù…ÙˆØ¹Ø¯ Ø§Ù„ØµÙŠØ§Ù†Ø© Ø§Ù„Ù‚Ø§Ø¯Ù…Ø© ÙˆØ§Ù„ÙˆÙ‚Øª Ø§Ù„Ù…ØªØ¨Ù‚ÙŠ ÙƒÙ„ ÙŠÙˆÙ….'}</p></div>`;
    return;
  }
  const lastLabel = maintenanceDateLabel(status.last, locale);
  const dueLabel = maintenanceDateLabel(status.due, locale);
  const elapsedLabel = maintenanceElapsedLabel(status);
  const remainingLabel = maintenanceRemainingLabel(status);
  const remainingShort = english
    ? `${Math.abs(status.daysRemaining)} ${Math.abs(status.daysRemaining) === 1 ? 'day' : 'days'}`
    : arabicCount(Math.abs(status.daysRemaining), { one: 'ÙŠÙˆÙ… ÙˆØ§Ø­Ø¯', two: 'ÙŠÙˆÙ…ÙŠÙ†', few: 'Ø£ÙŠØ§Ù…', many: 'ÙŠÙˆÙ…Ù‹Ø§' });
  const progressCaption = english
    ? `${status.progressPercent}% of the cycle completed`
    : `Ø§ÙƒØªÙ…Ù„Øª ${status.progressPercent}% Ù…Ù† Ø§Ù„Ø¯ÙˆØ±Ø©`;
  const overdueDaysShort = status.overdue
    ? (english
      ? `${Math.abs(status.daysRemaining)} ${Math.abs(status.daysRemaining) === 1 ? 'day' : 'days'}`
      : arabicCount(Math.abs(status.daysRemaining), { one: 'ÙŠÙˆÙ… ÙˆØ§Ø­Ø¯', two: 'ÙŠÙˆÙ…ÙŠÙ†', few: 'Ø£ÙŠØ§Ù…', many: 'ÙŠÙˆÙ…Ù‹Ø§' }))
    : '';
  const untilDueLabel = status.overdue
    ? (english ? 'Date passed' : 'Ø§Ù†Ù‚Ø¶Ù‰ Ø§Ù„Ù…ÙˆØ¹Ø¯')
    : status.monthsUntilDue > 0
      ? (english
        ? `in about ${status.monthsUntilDue} ${status.monthsUntilDue === 1 ? 'month' : 'months'}`
        : `Ø¨Ø¹Ø¯ ${arabicCount(status.monthsUntilDue, { one: 'Ø´Ù‡Ø± ÙˆØ§Ø­Ø¯', two: 'Ø´Ù‡Ø±ÙŠÙ†', few: 'Ø£Ø´Ù‡Ø±', many: 'Ø´Ù‡Ø±Ù‹Ø§' })}`)
      : (english ? 'within this month' : 'Ø®Ù„Ø§Ù„ Ù‡Ø°Ø§ Ø§Ù„Ø´Ù‡Ø±');
  const overdueNote = english
    ? 'Panels can be affected if maintenance is delayed: dust and deposits build up, airflow drops, and generation declines gradually. Book a maintenance visit and clean the panels safely.'
    : 'Ù‚Ø¯ ØªØªØ£Ø«Ø± Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø§Ù„Ø´Ù…Ø³ÙŠØ© Ø¥Ø°Ø§ ØªØ£Ø®Ø±Øª Ø§Ù„ØµÙŠØ§Ù†Ø©: ÙŠØªØ±Ø§ÙƒÙ… Ø§Ù„ØºØ¨Ø§Ø± ÙˆØ§Ù„ØªØ±Ø³Ø¨Ø§Øª ÙˆØªÙ‚Ù„ Ø§Ù„ØªÙ‡ÙˆÙŠØ© ÙˆÙŠÙ†Ø®ÙØ¶ Ø§Ù„Ø¥Ù†ØªØ§Ø¬ ØªØ¯Ø±ÙŠØ¬ÙŠÙ‹Ø§. Ø§Ø­Ø¬Ø² ØµÙŠØ§Ù†Ø© ÙˆÙ†Ø¸Ù‘Ù Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø¨Ø·Ø±ÙŠÙ‚Ø© Ø¢Ù…Ù†Ø©.';
  const dueSoonNote = english
    ? 'The next maintenance is close. Booking it now keeps the panels within their cleaning cycle.'
    : 'Ù…ÙˆØ¹Ø¯ Ø§Ù„ØµÙŠØ§Ù†Ø© Ø§Ù„Ù‚Ø§Ø¯Ù…Ø© Ø§Ù‚ØªØ±Ø¨. Ø§Ø­Ø¬Ø²Ù‡Ø§ Ø§Ù„Ø¢Ù† Ù„ØªØ¨Ù‚Ù‰ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø¶Ù…Ù† Ø¯ÙˆØ±Ø© Ø§Ù„ØµÙŠØ§Ù†Ø©.';
  const onScheduleNote = english
    ? 'The panels are on schedule. The app recalculates the remaining days from the saved date every time you open it.'
    : 'Ø§Ù„ØµÙŠØ§Ù†Ø© Ù…Ù†ØªØ¸Ù…Ø©. ÙŠØ­Ø³Ø¨ Ø³ÙŠØ§Ø¬ Ø§Ù„Ø£ÙŠØ§Ù… Ø§Ù„Ù…ØªØ¨Ù‚ÙŠØ© Ù…Ù† Ø§Ù„ØªØ§Ø±ÙŠØ® Ø§Ù„Ù…Ø­ÙÙˆØ¸ ÙÙŠ ÙƒÙ„ Ù…Ø±Ø© ØªÙØªØ­ ÙÙŠÙ‡Ø§ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚.';
  const note = status.overdue ? overdueNote : status.dueSoon ? dueSoonNote : onScheduleNote;
  container.innerHTML = `<div class="maintenance-grid">
      <div class="maintenance-stat"><span class="maintenance-stat-icon">ðŸ“…</span><div class="maintenance-stat-body"><small>${english ? 'Last maintenance' : 'Ø¢Ø®Ø± ØµÙŠØ§Ù†Ø©'}</small><b>${escapeHtml(lastLabel)}</b><span>${escapeHtml(elapsedLabel)}</span></div></div>
      <div class="maintenance-stat"><span class="maintenance-stat-icon">â³</span><div class="maintenance-stat-body"><small>${status.overdue ? (english ? 'Overdue by' : 'Ù…ØªØ£Ø®Ø±Ø© Ù…Ù†Ø°') : (english ? 'Time left' : 'Ø§Ù„ÙˆÙ‚Øª Ø§Ù„Ù…ØªØ¨Ù‚ÙŠ')}</small><b class="maintenance-remaining">${escapeHtml(overdueDaysShort || remainingShort)}</b><span>${escapeHtml(status.overdue ? (english ? 'Needs urgent attention' : 'ØªØ­ØªØ§Ø¬ ØµÙŠØ§Ù†Ø© Ø¹Ø§Ø¬Ù„Ø©') : progressCaption)}</span></div></div>
      <div class="maintenance-stat"><span class="maintenance-stat-icon">ðŸ”§</span><div class="maintenance-stat-body"><small>${english ? 'Next maintenance' : 'Ø§Ù„ØµÙŠØ§Ù†Ø© Ø§Ù„Ù‚Ø§Ø¯Ù…Ø©'}</small><b>${escapeHtml(dueLabel)}</b><span>${escapeHtml(untilDueLabel)}</span></div></div>
    </div>
    <div class="maintenance-progress">
      <div class="maintenance-progress-head"><span>${english ? 'Cycle progress' : 'ØªÙ‚Ø¯Ù… Ø§Ù„Ø¯ÙˆØ±Ø©'}</span><b>${status.progressPercent}%</b></div>
      <div class="maintenance-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${status.progressPercent}" aria-label="${english ? 'Maintenance cycle progress' : 'ØªÙ‚Ø¯Ù… Ø¯ÙˆØ±Ø© Ø§Ù„ØµÙŠØ§Ù†Ø©'}"><i style="width:${status.progressPercent}%"></i></div>
      <div class="maintenance-progress-foot"><span>${escapeHtml(lastLabel)}</span><span>${escapeHtml(dueLabel)}</span></div>
    </div>
    <p class="maintenance-note"><span class="maintenance-note-icon">${status.overdue ? 'âš ï¸' : status.dueSoon ? 'â°' : 'â„¹ï¸'}</span>${escapeHtml(note)}</p>`;
}

function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }
function el(id) { return document.getElementById(id); }
function translateText(value) {
  const source = String(value ?? '');
  const leading = source.match(/^\s*/)?.[0] || '';
  const trailing = source.match(/\s*$/)?.[0] || '';
  const exact = source.trim();
  if (TRANSLATIONS[exact]) return `${leading}${TRANSLATIONS[exact]}${trailing}`;
  let result = source;
  for (const arabic of TRANSLATION_KEYS) {
    if (arabic.length <= 2 && /[\u0600-\u06FF]/.test(arabic)) continue;
    result = result.replaceAll(arabic, TRANSLATIONS[arabic]);
  }
  result = result.replace(/Â°Ù…/g, 'Â°C');
  result = result.replace(/[Ù -Ù©]/g, (digit) => String('Ù Ù¡Ù¢Ù£Ù¤Ù¥Ù¦Ù§Ù¨Ù©'.indexOf(digit)));
  result = result.replace(/Ø§Ù„Ø®Ø·ÙˆØ© (\d+) Ù…Ù† (\d+)/g, 'Step $1 of $2');
  return result;
}
function applyLanguage() {
  const english = state.settings.language === 'en';
  document.documentElement.lang = english ? 'en' : 'ar';
  document.documentElement.dir = english ? 'ltr' : 'rtl';
  document.body.classList.toggle('english', english);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (!ORIGINAL_TEXT.has(node)) ORIGINAL_TEXT.set(node, node.nodeValue);
    const original = ORIGINAL_TEXT.get(node);
    node.nodeValue = english ? translateText(original) : original;
  }
  const attrNames = ['placeholder', 'aria-label', 'title', 'alt'];
  document.querySelectorAll('*').forEach((element) => {
    let originals = ORIGINAL_ATTRIBUTES.get(element);
    if (!originals) { originals = new Map(); ORIGINAL_ATTRIBUTES.set(element, originals); }
    for (const name of attrNames) {
      if (!element.hasAttribute(name)) continue;
      if (!originals.has(name)) originals.set(name, element.getAttribute(name));
      const original = originals.get(name);
      element.setAttribute(name, english ? translateText(original) : original);
    }
  });
  const toggle = el('language-toggle');
  if (toggle) { toggle.textContent = english ? 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©' : 'EN'; toggle.setAttribute('aria-label', english ? 'Switch to Arabic' : 'Switch to English'); }
  const languageSelect = el('setting-language');
  if (languageSelect) languageSelect.value = english ? 'en' : 'ar';
}
function showToast(message) {
  const toast = el('toast'); toast.textContent = state.settings.language === 'en' ? translateText(message) : message; toast.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 3100);
}
function syncHeader() {
  el('header-location').textContent = state.form.location || 'Ø­Ø¯Ù‘Ø¯ Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ù†Ø¸Ø§Ù…';
  const authButton = el('auth-nav');
  if (authButton) authButton.textContent = state.user?.username || 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„';
  const loggedIn = !!state.user;
  document.querySelector('.main-nav').hidden = !loggedIn;
  document.querySelector('.topbar-location').hidden = !loggedIn;
  applyLanguage();
}
function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(DB_STORE, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  });
}
async function dbRequest(mode, action) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DB_STORE, mode); const store = transaction.objectStore(DB_STORE);
    const request = action(store); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close(); transaction.onerror = () => reject(transaction.error);
  });
}
async function deleteMediaForAccount(accountId) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DB_STORE, 'readwrite');
    const request = transaction.objectStore(DB_STORE).openCursor();
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      if (cursor.value.accountId === accountId) cursor.delete();
      cursor.continue();
    };
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
  });
}
async function moveLegacyMedia(oldAccountId, newAccountId) {
  if (!oldAccountId || !newAccountId || oldAccountId === newAccountId) return;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DB_STORE, 'readwrite');
    const request = transaction.objectStore(DB_STORE).openCursor();
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      if (cursor.value.accountId === oldAccountId) cursor.update({ ...cursor.value, accountId: newAccountId });
      cursor.continue();
    };
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
  });
}
async function loadMedia() {
  try {
    if (currentAccount) await syncAccountMedia();
    const all = (await dbRequest('readonly', (store) => store.getAll())) || [];
    media = currentAccount ? all.filter((item) => item.accountId === currentAccount.id) : [];
  }
  catch (error) {
    const all = (await dbRequest('readonly', (store) => store.getAll()).catch(() => [])) || [];
    media = currentAccount ? all.filter((item) => item.accountId === currentAccount.id) : [];
    showToast(error.message || 'ØªØ¹Ø°Ø± Ù…Ø²Ø§Ù…Ù†Ø© Ø§Ù„Ù…Ø±ÙÙ‚Ø§Øª Ø§Ù„Ø¢Ù†.');
  }
  renderCurrentStep();
}
async function syncAccountMedia() {
  if (!currentAccount?.id) return;
  const listResponse = await authenticatedFetch('/api/account/media');
  const listData = await listResponse.json();
  if (!listResponse.ok) throw new Error(listData.error || 'ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ù…Ø±ÙÙ‚Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø¨.');
  const remote = new Map((listData.files || []).map((item) => [item.id, item]));
  const allFiles = (await dbRequest('readonly', (store) => store.getAll())) || [];
  const local = allFiles.filter((item) => item.accountId === currentAccount.id);
  const localById = new Map(local.map((item) => [item.id, item]));

  for (const item of local) {
    if (item.cloudSynced && !remote.has(item.id)) {
      await dbRequest('readwrite', (store) => store.delete(item.id));
      localById.delete(item.id);
      continue;
    }
    if (!item.cloudSynced) {
      const url = '/api/account/media/' + encodeURIComponent(item.id)
        + '?category=' + encodeURIComponent(item.category) + '&name=' + encodeURIComponent(item.name);
      const response = await authenticatedFetch(url, { method: 'POST', headers: { 'Content-Type': item.type || item.blob.type }, body: item.blob });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'ØªØ¹Ø°Ø± Ø±ÙØ¹ Ø£Ø­Ø¯ Ø§Ù„Ù…Ø±ÙÙ‚Ø§Øª Ø¥Ù„Ù‰ Ø§Ù„Ø­Ø³Ø§Ø¨.');
      const syncedItem = { ...item, cloudSynced: true };
      await dbRequest('readwrite', (store) => store.put(syncedItem));
      localById.set(item.id, syncedItem);
      remote.set(item.id, data.file);
    }
  }

  for (const item of remote.values()) {
    if (localById.has(item.id)) continue;
    const response = await authenticatedFetch('/api/account/media/' + encodeURIComponent(item.id));
    if (!response.ok) throw new Error('ØªØ¹Ø°Ø± ØªÙ†Ø²ÙŠÙ„ Ø£Ø­Ø¯ Ù…Ø±ÙÙ‚Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø¨.');
    const saved = { id: item.id, accountId: currentAccount.id, category: item.category, name: item.name, type: item.type, blob: await response.blob(), updatedAt: Date.parse(item.updated_at) || Date.now(), cloudSynced: true };
    await dbRequest('readwrite', (store) => store.put(saved));
    localById.set(item.id, saved);
  }
}
function saveFormField(target) {
  if (!target?.dataset?.field) return;
  const key = target.dataset.field;
  const value = key === 'brand' && isUnknownManufacturer(target.value) ? 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ' : target.value;
  if (!['name', 'billMonth', 'expectedMonthlyKwh', 'actualMonthlyKwh', 'invoice', 'consumption', 'tariff'].includes(key) && String(state.form[key]) !== String(value)) clearVisualAssessment();
  if (key === 'billMonth' && String(state.form.billMonth) !== String(target.value)) {
    state.form.expectedMonthlyKwh = ''; state.form.actualMonthlyKwh = ''; invoiceReview = null;
    for (const reading of ['expectedMonthlyKwh', 'actualMonthlyKwh']) { const input = el(`field-${reading}`); if (input) input.value = ''; }
    document.querySelector('.invoice-review')?.remove();
  }
  if (key === 'tilt' && String(state.form.tilt) !== String(target.value)) state.tiltWarningSeenFor = null;
  state.form[key] = value;
  if (key === 'ambientTemp') state.form.ambientTempManual = true;
  if (key === 'humidity') state.form.humidityManual = true;
  if (key === 'dust') state.form.dustManual = true;
  if (key === 'airDustPercent') state.form.airDustManual = true;
  if (Object.hasOwn(DEFAULT_STATE.weatherPrefill, key)) state.weatherPrefill[key] = null;
  if (['billMonth', 'expectedMonthlyKwh', 'actualMonthlyKwh', 'invoice', 'consumption', 'tariff', 'power', 'tilt', 'panelAzimuth', 'captureAt', 'coefficient'].includes(key)) state.monthlyLoss = null;
  if (['latitude', 'longitude', 'tilt', 'panelAzimuth', 'captureAt', 'coefficient', 'ambientTemp'].includes(key)) state.solarContext = null;
  persist();
  refreshWeatherFieldChecks();
  if (key === 'airDustPercent') {
    const hint = el('air-dust-hint'); if (hint) hint.textContent = airDustHint();
    target.setAttribute('aria-valuetext', `${target.value}%`);
  }
  if (key === 'tilt') {
    const warning = el('tilt-warning-slot');
    if (warning) warning.innerHTML = tiltWarningMarkup();
    updatePanelVisual();
  }
  if (target.type === 'range') {
    const output = document.querySelector(`[data-output="${key}"]`); if (output) output.textContent = `${target.value}%`;
  }
  if (currentStep === 3) renderCurrentStep();
}
function field(label, key, options = {}) {
  const { type = 'text', placeholder = '', suffix = '', hint = '', min, max, step, required = false, full = false, value } = options;
  const current = value ?? state.form[key] ?? '';
  const labelMarkup = `${label}${weatherFieldCheck(key)}`;
  const attrs = [`type="${type}"`, `data-field="${key}"`, `value="${escapeHtml(current)}"`];
  if (placeholder) attrs.push(`placeholder="${escapeHtml(placeholder)}"`);
  if (min !== undefined) attrs.push(`min="${min}"`); if (max !== undefined) attrs.push(`max="${max}"`); if (step !== undefined) attrs.push(`step="${step}"`);
  if (required) attrs.push('required');
  if (type === 'range') {
    const output = current === '' ? 'â€”' : `${escapeHtml(current)}%`;
    attrs[2] = `value="${escapeHtml(current === '' ? min ?? 0 : current)}"`;
    return `<div class="field ${full ? 'full' : ''}"><label for="field-${key}">${labelMarkup}</label><div class="range-row"><input id="field-${key}" ${attrs.join(' ')} aria-valuetext="${current === '' ? ui('ØºÙŠØ± Ù…ØªØ§Ø­', 'Unavailable') : `${escapeHtml(current)}%`}"><output data-output="${key}">${output}</output></div>${hint ? `<small class="helper-text" ${key === 'airDustPercent' ? 'id="air-dust-hint"' : ''}>${hint}</small>` : ''}</div>`;
  }
  return `<div class="field ${full ? 'full' : ''}"><label for="field-${key}">${labelMarkup}</label><div class="${suffix ? 'input-suffix' : ''}"><input id="field-${key}" ${attrs.join(' ')}>${suffix ? `<span>${suffix}</span>` : ''}</div>${hint ? `<small class="helper-text">${hint}</small>` : ''}</div>`;
}
function selectField(label, key, choices, options = {}) {
  const { full = false } = options; const current = state.form[key];
  return `<div class="field ${full ? 'full' : ''}"><label for="field-${key}">${label}</label><select id="field-${key}" data-field="${key}">${choices.map(([value, text]) => `<option value="${escapeHtml(value)}" ${current === value ? 'selected' : ''}>${escapeHtml(text)}</option>`).join('')}</select></div>`;
}
function manufacturerSearchKey(value) {
  return String(value ?? '').normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g, '').replace(/[Ø£Ø¥Ø¢Ù±]/g, 'Ø§').replace(/Ù‰/g, 'ÙŠ').replace(/Ø©/g, 'Ù‡').replace(/[\s._-]+/g, '');
}
function isUnknownManufacturer(value) {
  return ['ØºÙŠØ±Ù…Ø¹Ø±ÙˆÙ', 'unknown'].includes(manufacturerSearchKey(value));
}
function manufacturerField() {
  const value = isUnknownManufacturer(state.form.brand) ? ui('ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ', 'Unknown') : state.form.brand || '';
  return `<div class="field manufacturer-picker"><label for="field-brand">Ø§Ù„Ø´Ø±ÙƒØ© Ø§Ù„Ù…ØµÙ†Ù‘Ø¹Ø©</label><div class="manufacturer-input-row"><input id="field-brand" data-field="brand" type="text" role="combobox" aria-autocomplete="list" aria-haspopup="listbox" aria-expanded="false" aria-controls="manufacturer-options" aria-describedby="manufacturer-hint" autocomplete="off" placeholder="Ø§Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„Ø´Ø±ÙƒØ© Ø§Ù„Ù…ØµÙ†Ù‘Ø¹Ø©" value="${escapeHtml(value)}"><button class="manufacturer-toggle" type="button" aria-label="Ø¹Ø±Ø¶ Ø§Ù„Ø´Ø±ÙƒØ§Øª Ø§Ù„Ù…ØµÙ†Ù‘Ø¹Ø©" aria-controls="manufacturer-options" aria-expanded="false">âŒ„</button><div id="manufacturer-options" class="manufacturer-options" role="listbox" aria-label="Ø§Ù„Ø´Ø±ÙƒØ§Øª Ø§Ù„Ù…ØµÙ†Ù‘Ø¹Ø©" hidden></div></div><small id="manufacturer-hint" class="helper-text">Ø§Ø¨Ø­Ø« Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ø£Ùˆ Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©ØŒ Ø£Ùˆ Ø§ÙƒØªØ¨ Ø§Ø³Ù… Ø§Ù„Ø´Ø±ÙƒØ©. ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ø®ØªÙŠØ§Ø± Â«ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙÂ».</small></div>`;
}
function bindManufacturerPicker() {
  manufacturerPickerController?.abort();
  manufacturerPickerController = null;
  const input = el('field-brand');
  if (!input) return;
  const picker = input.closest('.manufacturer-picker');
  const toggle = picker.querySelector('.manufacturer-toggle');
  const list = el('manufacturer-options');
  manufacturerPickerController = new AbortController();
  const options = { signal: manufacturerPickerController.signal };
  let matches = []; let active = -1;
  const close = () => {
    list.hidden = true; input.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant'); active = -1;
  };
  const show = (query = input.value) => {
    const key = manufacturerSearchKey(query);
    const companies = PANEL_MANUFACTURERS.filter(([name, aliases]) => !key || [name, ...aliases].some((name) => manufacturerSearchKey(name).includes(key))).map(([name]) => ({ value: name, label: name }));
    const unknown = { value: 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ', label: ui('ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ', 'Unknown') };
    matches = key ? [...companies, unknown] : [unknown, ...companies]; active = -1;
    list.innerHTML = `${key && !companies.length && !isUnknownManufacturer(query) ? `<p class="manufacturer-no-results" role="status">${ui('ÙŠÙ…ÙƒÙ†Ùƒ Ø­ÙØ¸ Ø§Ù„Ø§Ø³Ù… Ø§Ù„Ø°ÙŠ ÙƒØªØ¨ØªÙ‡ØŒ Ø£Ùˆ Ø§Ø®ØªÙŠØ§Ø± Â«ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙÂ».', 'You can keep the name you entered, or choose â€œUnknownâ€.')}</p>` : ''}${matches.map((entry, index) => `<button type="button" tabindex="-1" role="option" class="manufacturer-option" id="manufacturer-option-${index}" data-manufacturer-index="${index}" aria-selected="false"><bdi>${escapeHtml(entry.label)}</bdi></button>`).join('')}`;
    list.hidden = false; input.setAttribute('aria-expanded', 'true'); toggle.setAttribute('aria-expanded', 'true'); input.removeAttribute('aria-activedescendant');
  };
  const activate = (index) => {
    active = (index + matches.length) % matches.length;
    list.querySelectorAll('[role="option"]').forEach((option, i) => option.setAttribute('aria-selected', String(i === active)));
    const option = el(`manufacturer-option-${active}`);
    input.setAttribute('aria-activedescendant', option.id); option.scrollIntoView({ block: 'nearest' });
  };
  const choose = (index) => {
    const entry = matches[index]; if (!entry) return;
    input.value = entry.label;
    saveFormField({ dataset: { field: 'brand' }, type: 'text', value: entry.value });
    input.focus(); close();
  };
  input.addEventListener('focus', () => show(), options);
  input.addEventListener('input', () => show(), options);
  input.addEventListener('keydown', (event) => {
    if (event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); if (list.hidden) show('');
      activate(active < 0 ? (event.key === 'ArrowDown' ? 0 : matches.length - 1) : active + (event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key === 'Enter') {
      event.preventDefault(); if (!list.hidden && active >= 0) choose(active); else close();
    } else if (event.key === 'Escape' || event.key === 'Tab') close();
  }, options);
  toggle.addEventListener('click', () => {
    if (!list.hidden) close(); else { input.focus(); show(''); }
  }, options);
  list.addEventListener('mousedown', (event) => { if (event.target.closest('[role="option"]')) event.preventDefault(); }, options);
  list.addEventListener('click', (event) => {
    const option = event.target.closest('[data-manufacturer-index]'); if (option) choose(Number(option.dataset.manufacturerIndex));
  }, options);
  picker.addEventListener('focusout', (event) => { if (!picker.contains(event.relatedTarget)) close(); }, options);
  document.addEventListener('pointerdown', (event) => { if (!picker.contains(event.target)) close(); }, options);
}
function renderRail() {
  el('step-rail').innerHTML = STEPS.map((step, index) => `<div class="rail-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'done' : ''}"><span class="rail-number">${index < currentStep ? 'âœ“' : index + 1}</span><span><b>${step.short}</b><small>${step.title}</small></span></div>`).join('');
  el('step-kicker').textContent = `Ø§Ù„Ø®Ø·ÙˆØ© ${currentStep + 1} Ù…Ù† ${STEPS.length}`;
  el('step-back').disabled = currentStep === 0;
  el('step-back').style.opacity = currentStep === 0 ? '.45' : '1';
  el('step-next').innerHTML = currentStep === STEPS.length - 1 ? 'Ø­ÙØ¸ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª <span>âœ“</span>' : 'Ø§Ù„ØªØ§Ù„ÙŠ <span>â†</span>';
  el('form-hint').textContent = currentStep === 3 ? 'ØªÙ‚Ø¯ÙŠØ±Ø§Øª Ø³ÙŠØ§Ø¬ Ø¥Ø±Ø´Ø§Ø¯ÙŠØ©' : 'ØªØ³ØªØºØ±Ù‚ Ø£Ù‚Ù„ Ù…Ù† Ø¯Ù‚ÙŠÙ‚ØªÙŠÙ†';
  const progress = el('wizard-progress-fill');
  if (progress) progress.style.width = `${Math.round(((currentStep + 1) / STEPS.length) * 100)}%`;
}
function mediaFor(category) { return media.filter((item) => item.category === category); }
function renderMedia(category) {
  const files = mediaFor(category);
  return `<div class="media-list">${files.map((item) => {
    const url = item.type.startsWith('image/') ? URL.createObjectURL(item.blob) : '';
    return `<span class="media-chip">${url ? `<img class="upload-preview" src="${url}" alt="">` : 'â–£'}<span>${escapeHtml(item.name)}</span><button type="button" data-remove-media="${escapeHtml(item.id)}" aria-label="Ø­Ø°Ù ${escapeHtml(item.name)}">Ã—</button></span>`;
  }).join('')}</div>`;
}
function uploadBlock(category, title, detail, accept, multiple = false) {
  return `<label class="upload-zone" data-drop-zone="${category}"><input type="file" data-upload="${category}" accept="${accept}" ${multiple ? 'multiple' : ''}><span class="upload-symbol">â†‘</span><b>${title}</b><small>${detail}</small></label>${renderMedia(category)}`;
}
function invoiceReviewMarkup() {
  if (!invoiceReview || invoiceReview.accountId !== currentAccount?.id) return '';
  const invoice = invoiceReview.invoice;
  const entries = [
    ['totalAmount', 'Ù‚ÙŠÙ…Ø© Ø§Ù„ÙØ§ØªÙˆØ±Ø©', 'number', '.001'], ['consumptionKwh', 'Ø§Ø³ØªÙ‡Ù„Ø§Ùƒ Ø§Ù„Ø·Ø§Ù‚Ø©', 'number', '.1'],
    ['energyTariffPerKwh', 'Ø§Ù„ØªØ¹Ø±ÙØ© Ù„ÙƒÙ„ kWh', 'number', '.0001'], ['billingMonth', 'Ø´Ù‡Ø± Ø§Ù„ÙØ§ØªÙˆØ±Ø©', 'month', ''],
    ['currency', 'Ø§Ù„Ø¹Ù…Ù„Ø©', 'text', ''],
  ];
  const notices = [invoice.summary, ...(invoice.ambiguities || [])].filter((value) => typeof value === 'string' && value);
  const charges = [['energyCharges', ui('Ø±Ø³ÙˆÙ… Ø§Ù„Ø·Ø§Ù‚Ø©', 'Energy charges')], ['fixedCharges', ui('Ø±Ø³ÙˆÙ… Ø«Ø§Ø¨ØªØ©', 'Fixed charges')], ['taxes', ui('Ø§Ù„Ø¶Ø±Ø§Ø¦Ø¨', 'Taxes')], ['otherCharges', ui('Ø±Ø³ÙˆÙ… Ø£Ø®Ø±Ù‰', 'Other charges')]];
  return `<section class="invoice-review" aria-labelledby="invoice-review-title"><h3 id="invoice-review-title">Ø±Ø§Ø¬Ø¹ Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ÙØ§ØªÙˆØ±Ø©</h3><p>Ù‡Ø°Ù‡ Ù‚Ø±Ø§Ø¡Ø© Ø¢Ù„ÙŠØ© Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„Ø®Ø·Ø£. Ø±Ø§Ø¬Ø¹ Ø§Ù„Ø£Ø±Ù‚Ø§Ù… ÙˆØ§Ù„Ø¹Ù…Ù„Ø© ÙˆØ§Ù„Ø´Ù‡Ø± Ù‚Ø¨Ù„ Ø§Ø³ØªØ®Ø¯Ø§Ù…Ù‡Ø§. Ø§Ù„ÙØ§ØªÙˆØ±Ø© ÙˆØ­Ø¯Ù‡Ø§ Ù„Ø§ ØªØ«Ø¨Øª Ø®Ø³Ø§Ø±Ø© Ø§Ù„Ø£Ù„ÙˆØ§Ø­.</p><p class="helper-text">${ui('Ø§Ù„Ø«Ù‚Ø© ÙÙŠ Ø§Ù„Ù‚Ø±Ø§Ø¡Ø©', 'Extraction confidence')}: ${confidenceText(invoice.confidence)}${invoice.documentReadable === false ? ` Â· ${ui('Ø§Ù„ÙØ§ØªÙˆØ±Ø© ØºÙŠØ± Ù…Ù‚Ø±ÙˆØ¡Ø© Ø¨ÙˆØ¶ÙˆØ­', 'The bill is not clearly readable')}` : ''}</p><p class="helper-text">${ui('Ø§Ù„ÙØªØ±Ø© Ø§Ù„Ø¸Ø§Ù‡Ø±Ø© ÙÙŠ Ø§Ù„ÙØ§ØªÙˆØ±Ø©', 'Printed billing period')}: ${escapeHtml(invoice.billingStart || 'â€”')} â€” ${escapeHtml(invoice.billingEnd || 'â€”')}</p><div class="field-grid">${entries.map(([key, label, type, step]) => `<div class="field"><label for="invoice-review-${key}">${label}</label><input id="invoice-review-${key}" data-invoice-review="${key}" type="${type}" value="${escapeHtml(invoice[key] ?? '')}" ${type === 'number' ? `min="0" step="${step}"` : ''}></div>`).join('')}</div><div class="assessment-metrics">${charges.map(([key, label]) => assessmentMetric(label, assessmentValue(invoice[key], '', 3))).join('')}</div><p class="helper-text">${ui('ØªÙØ³ØªØ®Ø¯Ù… ÙÙ‚Ø· Ø§Ù„Ø­Ù‚ÙˆÙ„ Ø§Ù„ØªÙŠ Ø±Ø§Ø¬Ø¹ØªÙ‡Ø§ Ø£Ø¹Ù„Ø§Ù‡. Ø¥Ø°Ø§ ØªØ±ÙƒØª Ù…Ø¨Ù„Øº Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ø£Ùˆ Ø§Ù„Ø§Ø³ØªÙ‡Ù„Ø§Ùƒ Ø£Ùˆ Ø§Ù„ØªØ¹Ø±ÙØ© ÙØ§Ø±ØºØ§Ù‹ØŒ ØªÙÙ…Ø³Ø­ Ù‚ÙŠÙ…ØªÙ‡ Ø§Ù„Ø³Ø§Ø¨Ù‚Ø©. Ù„Ø§ ØªÙØ´ØªÙ‚ ØªØ¹Ø±ÙØ© Ø§Ù„Ø·Ø§Ù‚Ø© Ù…Ù† Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ù„Ù‡Ø°Ø§ Ø§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„Ø´Ù‡Ø±ÙŠ.', 'Only the reviewed fields above are applied. Leaving amount, consumption or tariff blank clears its previous value. The monthly assessment does not derive an energy tariff from the bill total.')}</p>${notices.length ? `<ul class="assessment-notes">${notices.map((value) => `<li>${escapeHtml(value)}</li>`).join('')}</ul>` : ''}<div class="invoice-review-actions"><button type="button" class="button button-primary" id="apply-invoice">Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©</button><button type="button" class="button button-outline" id="cancel-invoice">Ø¥Ù„ØºØ§Ø¡</button></div></section>`;
}
function renderCurrentStep() {
  renderRail(); const target = el('step-content');
  clearFormAlert();
  if (currentStep === 0) {
    target.innerHTML = `<h2 class="step-title">${STEPS[0].title}</h2><p class="step-description">${STEPS[0].description}</p><button class="button button-outline weather-location-action" type="button" id="gps-button">âŒ– Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù…ÙˆÙ‚Ø¹Ùƒ Ø§Ù„Ø­Ø§Ù„ÙŠ</button><p class="gps-status${gpsNotice ? ` gps-${gpsNotice.type}` : ''}" id="gps-status" role="status" aria-live="polite" ${gpsNotice ? '' : 'hidden'}>${gpsNotice ? escapeHtml(gpsNoticeText(gpsNotice.code)) : ''}</p><div class="field-grid">
      ${field('Ø§Ø³Ù…Ùƒ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)', 'name', { placeholder: 'Ù…Ø«Ø§Ù„: Ù…Ø±ÙŠÙ…' })}
      ${field('Ø¯Ø±Ø¬Ø© Ø­Ø±Ø§Ø±Ø© Ø§Ù„Ø¬Ùˆ', 'ambientTemp', { type: 'number', suffix: 'Â°Ù…', placeholder: '35', min: '-10', max: '65', step: '0.1' })}
      ${field('Ø§Ù„Ø±Ø·ÙˆØ¨Ø© Ø§Ù„Ù†Ø³Ø¨ÙŠØ©', 'humidity', { type: 'number', suffix: '%', placeholder: '45', min: '0', max: '100' })}
      ${field('Ø¹Ø¯Ø¯ Ø§Ù„Ø£Ù„ÙˆØ§Ø­', 'panels', { type: 'number', placeholder: '12', min: '1', max: '10000' })}
      ${field('Ø§Ù„ØºØ¨Ø§Ø± ÙÙŠ Ø§Ù„Ø¬Ùˆ', 'airDustPercent', { type: 'range', min: '0', max: '100', hint: airDustHint(), full: true })}
      <div class="field full"><span class="field-label">Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ù†Ø¸Ø§Ù…</span><div class="inline-search"><input id="city-search" class="field-input" placeholder="Ø§Ø¨Ø­Ø« Ø¹Ù† Ù…Ø¯ÙŠÙ†Ø© Ø£Ùˆ Ù…Ø­Ø§ÙØ¸Ø©" value="${escapeHtml(state.form.location)}"><button class="button button-outline" type="button" id="city-search-button">Ø¨Ø­Ø«</button></div><div class="search-results" id="search-results"></div><small class="helper-text">Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ø¯Ù‚ÙŠÙ‚ Ø§Ø®ØªÙŠØ§Ø±ÙŠØ› Ø§Ø³ØªØ®Ø¯Ù… GPS Ù„Ø¬Ù„Ø¨ Ø§Ù„Ø·Ù‚Ø³ Ø§Ù„Ø£Ù‚Ø±Ø¨.</small><div class="weather-prefill"><span>Ø­Ø§Ù„Ø© Ø§Ù„Ø·Ù‚Ø³ Ø§Ù„Ø­Ø§Ù„ÙŠØ©</span><b id="wizard-weather-condition">${state.weather?.current ? weatherText(state.weather.current.weather_code) : 'ØªØ¸Ù‡Ø± Ø¨Ø¹Ø¯ ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…ÙˆÙ‚Ø¹'}</b></div></div>
      </div>`;
  } else if (currentStep === 1) {
    target.innerHTML = `<h2 class="step-title">${STEPS[1].title}</h2><p class="step-description">${STEPS[1].description}</p><div class="field-grid">
      ${field('Ø§Ù„Ù‚Ø¯Ø±Ø© Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠØ© Ù„Ù„Ù†Ø¸Ø§Ù…', 'power', { type: 'number', suffix: 'ÙˆØ§Ø·', placeholder: '5000', min: '1' })}
      ${manufacturerField()}
      ${field('Ø§Ø³Ù… Ø´Ø±ÙƒØ© Ø§Ù„Ø£Ù„ÙˆØ§Ø­', 'company', { placeholder: 'Ù…Ø«Ø§Ù„: Ø´Ø±ÙƒØ© Ø§Ù„Ù†ÙˆØ± Ù„Ù„Ø·Ø§Ù‚Ø© Ø§Ù„Ø´Ù…Ø³ÙŠØ©', hint: ui('Ø§ÙƒØªØ¨ Ø§Ø³Ù… Ø§Ù„Ø´Ø±ÙƒØ© Ø§Ù„Ù…ØµÙ†Ù‘Ø¹Ø© Ø£Ùˆ Ø§Ù„Ù…ÙˆØ±Ù‘Ø¯ ÙƒÙ…Ø§ ÙŠØ¸Ù‡Ø± ÙÙŠ ÙØ§ØªÙˆØ±Ø© Ø§Ù„Ø´Ø±Ø§Ø¡ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ).', 'Enter the manufacturer or supplier name as shown on the purchase invoice (optional).') })}
      ${field('Ø¢Ø®Ø± ØµÙŠØ§Ù†Ø© Ù„Ù„Ø£Ù„ÙˆØ§Ø­', 'lastMaintenanceAt', { type: 'date', max: todayIsoDate(), hint: ui('ØªØ§Ø±ÙŠØ® Ø¢Ø®Ø± ØµÙŠØ§Ù†Ø© Ø£Ùˆ ØªÙ†Ø¸ÙŠÙ Ø´Ø§Ù…Ù„. Ù…Ù†Ù‡ Ù†Ø­Ø³Ø¨ Ø§Ù„ØµÙŠØ§Ù†Ø© Ø§Ù„Ù‚Ø§Ø¯Ù…Ø© ÙƒÙ„ 6 Ø£Ø´Ù‡Ø± ÙˆÙ†Ù†Ø¨Ù‘Ù‡Ùƒ Ù‚Ø¨Ù„ Ù…ÙˆØ¹Ø¯Ù‡Ø§.', 'Date of the last maintenance or deep clean. We use it to schedule the next maintenance every 6 months and remind you before it is due.') })}
      ${field('Ù…ÙŠÙ„ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø¹Ù† Ø§Ù„Ø£ÙÙ‚ÙŠ', 'tilt', { type: 'number', suffix: 'Â°', placeholder: '20', min: '0', max: '90' })}
      ${field('Ø§ØªØ¬Ø§Ù‡ ÙˆØ§Ø¬Ù‡Ø© Ø§Ù„Ø£Ù„ÙˆØ§Ø­ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)', 'panelAzimuth', { type: 'number', suffix: 'Â°', placeholder: '180', min: '0', max: '360', step: '1', hint: '0Â° Ø´Ù…Ø§Ù„ Â· 90Â° Ø´Ø±Ù‚ Â· 180Â° Ø¬Ù†ÙˆØ¨ Â· 270Â° ØºØ±Ø¨. Ø£Ø¯Ø®Ù„ Ù‚Ø±Ø§Ø¡Ø© Ø¨ÙˆØµÙ„Ø© Ù„Ù„ÙˆØ§Ø¬Ù‡Ø© Ø§Ù„ØªÙŠ ØªÙˆØ§Ø¬Ù‡ Ø§Ù„Ø´Ù…Ø³.' })}
      ${field('ÙˆÙ‚Øª ØªØµÙˆÙŠØ± Ø§Ù„Ø£Ù„ÙˆØ§Ø­', 'captureAt', { type: 'datetime-local', hint: 'ÙˆÙ‚Øª Ù…Ø­Ù„ÙŠ ØªØ®ØªØ§Ø±Ù‡Ø› Ù„Ø§ Ù†Ø³ØªØ®Ø±Ø¬Ù‡ Ù…Ù† Ø§Ù„ÙÙŠØ¯ÙŠÙˆ. ÙŠÙ„Ø²Ù… Ø§Ù„Ù…ÙˆÙ‚Ø¹ ÙˆØ§Ù„Ù…ÙŠÙ„ ÙˆØ§Ù„Ø§ØªØ¬Ø§Ù‡ ÙˆØ§Ù„ÙˆÙ‚Øª Ù„Ø­Ø³Ø§Ø¨ Ø²Ø§ÙˆÙŠØ© Ø§Ù„Ø´Ù…Ø³.', full: true })}
      <div class="field full"><button class="text-button" type="button" id="capture-now">${ui('Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„ÙˆÙ‚Øª Ø§Ù„Ø­Ø§Ù„ÙŠ Ø¥Ø°Ø§ ØµÙˆÙ‘Ø±Øª Ø§Ù„Ø¢Ù†', 'Use the current time if you filmed just now')}</button></div>
      <div id="tilt-warning-slot" class="field full">${tiltWarningMarkup()}</div>
      ${selectField('Ù†ÙˆØ¹ Ø§Ù„Ø£Ù„ÙˆØ§Ø­', 'panelType', [['monocrystalline', 'Ø£Ø­Ø§Ø¯ÙŠØ© Ø§Ù„Ø¨Ù„ÙˆØ±Ø©'], ['polycrystalline', 'Ù…ØªØ¹Ø¯Ø¯Ø© Ø§Ù„Ø¨Ù„ÙˆØ±Ø§Øª'], ['thin-film', 'Ø£ØºØ´ÙŠØ© Ø±Ù‚ÙŠÙ‚Ø©'], ['unknown', 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ']])}
      ${field('ÙƒÙØ§Ø¡Ø© Ø§Ù„Ù„ÙˆØ­ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)', 'efficiency', { type: 'number', suffix: '%', placeholder: '21', min: '1', max: '40', step: '.1' })}
      ${field('Ù…Ø¹Ø§Ù…Ù„ Ø§Ù„Ø­Ø±Ø§Ø±Ø© (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)', 'coefficient', { type: 'number', suffix: '%/Â°Ù…', placeholder: '-0.35', step: '.01', hint: 'ØºØ§Ù„Ø¨Ø§Ù‹ Ø¨ÙŠÙ† â€Ž-0.25 Ùˆâ€Ž-0.50 Ù„ÙƒÙ„ Ø¯Ø±Ø¬Ø©.' })}
      ${field('Ù‚Ø¯Ø±Ø© Ø§Ù„Ù„ÙˆØ­ Ø§Ù„ÙˆØ§Ø­Ø¯ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)', 'ratedPower', { type: 'number', suffix: 'ÙˆØ§Ø·', placeholder: '450', min: '1' })}
      <div class="field full"><span class="field-label">ØµÙˆØ±Ø© Ø£Ùˆ ÙÙŠØ¯ÙŠÙˆ Ù„Ù„Ø£Ù„ÙˆØ§Ø­</span>${uploadBlock('panels', 'Ø£Ø¶Ù ØµÙˆØ±Ø© Ø£Ùˆ Ù…Ù‚Ø·Ø¹Ø§Ù‹ Ù‚ØµÙŠØ±Ø§Ù‹', 'ØµÙˆØ±Ø© ÙˆØ§Ø¶Ø­Ø© Ø£Ùˆ ÙÙŠØ¯ÙŠÙˆ Ù…Ù† 5 Ø¥Ù„Ù‰ 10 Ø«ÙˆØ§Ù†Ù Â· Ø­ØªÙ‰ 6 Ù…Ù„ÙØ§ØªØŒ 25 Ù…ÙŠØºØ§Ø¨Ø§ÙŠØª Ù„Ù„Ù…Ù„Ù', 'image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm', true)}<small class="helper-text">ÙŠÙØ­Øµ Claude ØµÙˆØ±Ø§Ù‹ ÙˆÙ„Ù‚Ø·Ø§Øª Ù…Ø®ØªØ§Ø±Ø© Ù…Ù† Ø§Ù„Ù…Ù‚Ø§Ø·Ø¹ØŒ Ø­ØªÙ‰ 8 ØµÙˆØ± ÙÙŠ Ø§Ù„Ø·Ù„Ø¨. Ù„Ø§ ÙŠÙØ­Øµ Ø§Ù„ØµÙˆØª Ø£Ùˆ ÙƒÙ„ Ø¥Ø·Ø§Ø±Ø§Øª Ø§Ù„ÙÙŠØ¯ÙŠÙˆ.</small><small class="helper-text">Ù„Ø§ ÙŠÙ…ÙƒÙ† Ù‚ÙŠØ§Ø³ Ø­Ø±Ø§Ø±Ø© Ø§Ù„Ø³Ø·Ø­ Ø£Ùˆ Ø²Ø§ÙˆÙŠØ© Ø§Ù„Ù…ÙŠÙ„ Ø§Ù„Ø¯Ù‚ÙŠÙ‚Ø© Ù…Ù† ØµÙˆØ±Ø© Ø¹Ø§Ø¯ÙŠØ©Ø› ÙŠØ¹ØªÙ…Ø¯ Ø§Ù„Ø­Ø³Ø§Ø¨ Ø¹Ù„Ù‰ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ØªÙŠ ØªØ¯Ø®Ù„Ù‡Ø§ ÙˆØ§Ù„Ø·Ù‚Ø³.</small><small class="helper-text">ØªÙØ±Ø³Ù„ Ø§Ù„ØµÙˆØ± ÙˆØ§Ù„Ù„Ù‚Ø·Ø§Øª Ø¥Ù„Ù‰ Anthropic ÙÙ‚Ø· Ø¹Ù†Ø¯ Ø¶ØºØ· Â«ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… ClaudeÂ».</small>${claudeAvailabilityMarkup()}</div>
      </div>`;
  } else if (currentStep === 2) {
    target.innerHTML = `<h2 class="step-title">${STEPS[2].title}</h2><p class="step-description">${STEPS[2].description}</p><div class="field-grid">
      ${field('Ù‚ÙŠÙ…Ø© Ø§Ù„ÙØ§ØªÙˆØ±Ø©', 'invoice', { type: 'number', suffix: 'Ø±.Ø¹', placeholder: '25.000', min: '0', step: '.001' })}
      ${field('Ø§Ù„Ø§Ø³ØªÙ‡Ù„Ø§Ùƒ Ù…Ù† Ø§Ù„ÙØ§ØªÙˆØ±Ø© (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)', 'consumption', { type: 'number', suffix: 'kWh', placeholder: '950', min: '0', step: '.1', hint: 'Ø¥Ù† ØªÙˆÙØ±ØŒ Ù†Ø³ØªØ®Ø¯Ù…Ù‡ Ù„Ø§Ø´ØªÙ‚Ø§Ù‚ ØªØ¹Ø±ÙØ© Ø§Ù„ÙƒÙ‡Ø±Ø¨Ø§Ø¡ Ø§Ù„ØªÙ‚Ø±ÙŠØ¨ÙŠØ©.' })}
      ${field('ØªØ¹Ø±ÙØ© Ø§Ù„ÙƒÙ‡Ø±Ø¨Ø§Ø¡ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)', 'tariff', { type: 'number', suffix: 'Ø±.Ø¹/kWh', placeholder: 'Ù…Ø«Ø§Ù„: 0.025', min: '0', step: '.001', hint: ui('Ø£Ø¯Ø®Ù„ Ø³Ø¹Ø± ÙˆØ­Ø¯Ø© Ø§Ù„Ø·Ø§Ù‚Ø© ÙÙ‚Ø·ØŒ Ø¯ÙˆÙ† Ø§Ù„Ø±Ø³ÙˆÙ… ÙˆØ§Ù„Ø¶Ø±Ø§Ø¦Ø¨Ø› ÙŠÙ„Ø²Ù… Ù„Ø­Ø³Ø§Ø¨ Ù‚ÙŠÙ…Ø© Ø®Ø³Ø§Ø±Ø© Ø§Ù„Ø´Ù‡Ø±.', 'Enter the energy unit rate excluding fees and taxes; this is needed to value the monthly deficit.') })}
      ${field('Ø´Ù‡Ø± Ø§Ù„ÙØ§ØªÙˆØ±Ø©', 'billMonth', { type: 'month' })}
      ${field('Ø¥Ù†ØªØ§Ø¬ Ù…ØªÙˆÙ‚Ø¹ Ù„Ù„Ø´Ù‡Ø± (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)', 'expectedMonthlyKwh', { type: 'number', suffix: 'kWh', min: '0', step: '.1', hint: 'Ø§Ø³ØªØ®Ø¯Ù… Ø®Ø· Ø£Ø³Ø§Ø³ Ù…ÙˆØ«ÙˆÙ‚Ø§Ù‹ Ù„Ù„Ù†Ø¸Ø§Ù…. ÙŠØ¬Ø¨ Ø£Ù† ÙŠØºØ·ÙŠ Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ø§Ù„Ù…ØªÙˆÙ‚Ø¹ ÙˆØ§Ù„ÙØ¹Ù„ÙŠ Ø§Ù„ÙØªØ±Ø© Ù†ÙØ³Ù‡Ø§.' })}
      ${field('Ø¥Ù†ØªØ§Ø¬ ÙØ¹Ù„ÙŠ Ù„Ù„Ø´Ù‡Ø± (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)', 'actualMonthlyKwh', { type: 'number', suffix: 'kWh', min: '0', step: '.1', hint: 'Ù‚Ø±Ø§Ø¡Ø© Ø¹Ø¯Ù‘Ø§Ø¯ Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ø£Ùˆ Ø§Ù„Ø¹Ø§ÙƒØ³Ø› Ø§Ø³ØªÙ‡Ù„Ø§Ùƒ Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ù„ÙŠØ³ Ø¥Ù†ØªØ§Ø¬ Ø§Ù„Ø£Ù„ÙˆØ§Ø­.' })}
      <p class="helper-text field full">${ui('Ù„Ù„Ø´Ù‡Ø± Ø§Ù„Ø­Ø§Ù„ÙŠ: Ø£Ø¯Ø®Ù„ Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ø­ØªÙ‰ Ù†Ù‡Ø§ÙŠØ© Ø£Ù…Ø³ ÙÙŠ Ø§Ù„Ø­Ù‚Ù„ÙŠÙ†. Ù„Ù„Ø£Ø´Ù‡Ø± Ø§Ù„Ù…Ø§Ø¶ÙŠØ©: Ø£Ø¯Ø®Ù„ Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ø´Ù‡Ø± Ø§Ù„ÙƒØ§Ù…Ù„.', 'For the current month, enter generation through the end of yesterday in both fields. For past months, enter full-month totals.')}</p>
      <div class="field full"><span class="field-label">ØµÙˆØ±Ø© Ø§Ù„ÙØ§ØªÙˆØ±Ø© (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)</span>${uploadBlock('bill', 'Ø£Ø±ÙÙ‚ ØµÙˆØ±Ø© Ø§Ù„ÙØ§ØªÙˆØ±Ø©', ui('JPG Ø£Ùˆ PNG Ø£Ùˆ WEBP Â· Ø­ØªÙ‰ 25 Ù…ÙŠØºØ§Ø¨Ø§ÙŠØª', 'JPG, PNG or WEBP Â· up to 25 MB'), 'image/jpeg,image/png,image/webp')}<p class="helper-text">Ù‚Ø¯ ØªØªØ¶Ù…Ù† Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ø¨ÙŠØ§Ù†Ø§Øª Ø´Ø®ØµÙŠØ©Ø› Ø§Ø­Ø¬Ø¨ Ù…Ø§ Ù„Ø§ ÙŠÙ„Ø²Ù…. Ù„Ù† ØªÙØ±Ø³Ù„ Ø¥Ù„Ù‰ Anthropic Ø¥Ù„Ø§ Ø¹Ù†Ø¯ Ø¶ØºØ· Ø²Ø± ØªØ­Ù„ÙŠÙ„ Ø§Ù„ÙØ§ØªÙˆØ±Ø©.</p>${claudeAvailabilityMarkup()}<button class="button button-outline invoice-ai-button" type="button" id="analyze-invoice" aria-busy="${invoiceBusy}" ${invoiceBusy || claudeEnabled !== true || !mediaFor('bill').length ? 'disabled' : ''}>${invoiceBusy ? 'Ø¬Ø§Ø±Ù Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ÙØ§ØªÙˆØ±Ø©â€¦' : 'ØªØ­Ù„ÙŠÙ„ Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Ai'}</button>${invoiceReviewMarkup()}</div>
      </div>`;
  } else {
    const f = state.form; const attachments = mediaFor('panels').length;
    const reviewLocale = state.settings.language === 'en' ? 'en-OM' : 'ar-OM';
    const reviewMaintenance = parseIsoDate(f.lastMaintenanceAt);
    const summary = [['Ø§Ø³Ù… ØµØ§Ø­Ø¨ Ø§Ù„Ù†Ø¸Ø§Ù…', f.name || 'â€”'], ['Ø§Ù„Ù…ÙˆÙ‚Ø¹', f.location || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'], ['Ø¹Ø¯Ø¯ Ø§Ù„Ø£Ù„ÙˆØ§Ø­', f.panels ? `${f.panels} Ù„ÙˆØ­` : 'â€”'], ['Ø§Ù„Ù‚Ø¯Ø±Ø© Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠØ©', f.power ? `${f.power} ÙˆØ§Ø·` : 'â€”'], ['Ø§Ù„Ù†ÙˆØ¹', ({ monocrystalline: 'Ø£Ø­Ø§Ø¯ÙŠØ© Ø§Ù„Ø¨Ù„ÙˆØ±Ø©', polycrystalline: 'Ù…ØªØ¹Ø¯Ø¯Ø© Ø§Ù„Ø¨Ù„ÙˆØ±Ø§Øª', 'thin-film': 'Ø£ØºØ´ÙŠØ© Ø±Ù‚ÙŠÙ‚Ø©', unknown: 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ' })[f.panelType]], ['Ø´Ø±ÙƒØ© Ø§Ù„Ø£Ù„ÙˆØ§Ø­', f.company || 'â€”'], ['Ø¢Ø®Ø± ØµÙŠØ§Ù†Ø©', reviewMaintenance ? maintenanceDateLabel(reviewMaintenance, reviewLocale) : 'Ù„Ù… ØªÙØ³Ø¬Ù„'], ['Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ø§Ù„Ø´Ù‡Ø±ÙŠØ©', f.invoice ? `${f.invoice} Ø±.Ø¹` : 'Ù„Ù… ØªÙØ¶Ù'], ['Ø´Ù‡Ø± Ø§Ù„ÙØ§ØªÙˆØ±Ø©', f.billMonth || 'â€”'], ['Ø§Ù„Ù…Ø±ÙÙ‚Ø§Øª', attachments ? `${attachments} Ù…Ù„Ù Ù„Ù„Ø£Ù„ÙˆØ§Ø­` : 'Ù„Ø§ ØªÙˆØ¬Ø¯ ØµÙˆØ±Ø©/ÙÙŠØ¯ÙŠÙˆ']];
    target.innerHTML = `<h2 class="step-title">${STEPS[3].title}</h2><p class="step-description">${STEPS[3].description}</p><div class="confirmation-grid">${summary.map(([label, value]) => `<div class="confirm-card"><small>${label}</small><b>${escapeHtml(value)}</b></div>`).join('')}</div><div class="confirmation-callout">${ui('Ø­ÙØ¸ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙŠØ­Ø³Ø¨ ØªÙ‚Ø¯ÙŠØ± Ø§Ù„Ø¥Ø¯Ø®Ø§Ù„Ø§Øª ÙˆØ§Ù„Ø´Ù‡Ø±. ÙŠÙ…ÙƒÙ†Ùƒ Ø¨Ø¹Ø¯ Ø§Ù„Ø­ÙØ¸ Ø·Ù„Ø¨ ÙØ­Øµ Claude Ù…Ù† Ø§Ù„Ø²Ø± Ø§Ù„Ù…Ø®ØµØµ ÙÙŠ Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©. Ù†Ø³Ø¨Ø© Ø§Ù„ØªØºØ·ÙŠØ© Ø§Ù„Ù…Ø±Ø¦ÙŠØ© Ù„Ø§ ØªØ³Ø§ÙˆÙŠ Ù†Ø³Ø¨Ø© Ø®Ø³Ø§Ø±Ø© Ø§Ù„Ø·Ø§Ù‚Ø©Ø› Ø­Ø³Ø§Ø¨ Ø®Ø³Ø§Ø±Ø© Ø§Ù„Ø´Ù‡Ø± ÙŠØ­ØªØ§Ø¬ Ø¥Ù†ØªØ§Ø¬Ø§Ù‹ ÙØ¹Ù„ÙŠØ§Ù‹ ÙˆØ®Ø· Ø£Ø³Ø§Ø³ Ù…ØªÙˆÙ‚Ø¹Ø§Ù‹ Ø£Ùˆ ØªÙ‚Ø¯ÙŠØ±Ø§Ù‹ Ù…Ù† Ø·Ù‚Ø³ Ø§Ù„ÙØªØ±Ø©.', 'Saving details calculates the input estimate and monthly assessment. After saving, request Claude from its button on the home page. Visible coverage is not energy loss; monthly losses need actual generation and an expected baseline or a period weather model.')} ${attachments ? 'ØªÙØ±Ø³Ù„ Ø§Ù„ØµÙˆØ± ÙˆØ§Ù„Ù„Ù‚Ø·Ø§Øª Ø¥Ù„Ù‰ Anthropic ÙÙ‚Ø· Ø¹Ù†Ø¯ Ø¶ØºØ· Â«ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… ClaudeÂ».' : 'Ø£Ø¶Ù ØµÙˆØ±Ø© Ù„Ù„Ø£Ù„ÙˆØ§Ø­ ÙÙŠ Ø§Ù„Ø®Ø·ÙˆØ© Ø§Ù„Ø³Ø§Ø¨Ù‚Ø© Ù„ØªÙØ¹ÙŠÙ„ Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø¨ØµØ±ÙŠ.'}</div>${claudeAvailabilityMarkup()}`;
  }
  target.querySelectorAll('[data-field]').forEach((input) => input.addEventListener('input', () => saveFormField(input)));
  target.querySelectorAll('[data-field]').forEach((input) => input.addEventListener('change', () => saveFormField(input)));
  target.querySelectorAll('[data-upload]').forEach((input) => input.addEventListener('change', () => handleUploads(input.dataset.upload, [...input.files])));
  target.querySelectorAll('[data-remove-media]').forEach((button) => button.addEventListener('click', () => removeMedia(button.dataset.removeMedia)));
  const gps = el('gps-button'); if (gps) gps.addEventListener('click', getLocation);
  el('analyze-invoice')?.addEventListener('click', analyzeInvoice);
  el('capture-now')?.addEventListener('click', () => { state.form.captureAt = localCaptureTime(); state.solarContext = null; state.monthlyLoss = null; persist(); renderCurrentStep(); });
  el('apply-invoice')?.addEventListener('click', applyInvoiceReview);
  el('cancel-invoice')?.addEventListener('click', () => { invoiceReview = null; renderCurrentStep(); });
  target.querySelectorAll('[data-invoice-review]').forEach((input) => input.addEventListener('input', () => { if (invoiceReview) invoiceReview.invoice[input.dataset.invoiceReview] = input.value; }));
  const citySearch = el('city-search-button'); if (citySearch) citySearch.addEventListener('click', searchCity);
  const searchInput = el('city-search'); if (searchInput) searchInput.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); searchCity(); } });
  target.querySelectorAll('[data-drop-zone]').forEach((zone) => {
    zone.addEventListener('dragover', (event) => { event.preventDefault(); zone.classList.add('dragging'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragging'));
    zone.addEventListener('drop', (event) => { event.preventDefault(); zone.classList.remove('dragging'); handleUploads(zone.dataset.dropZone, [...event.dataTransfer.files]); });
  });
  applyLanguage();
  bindManufacturerPicker();
}
function openWizard(step = 0) {
  currentStep = step; showPage('wizard'); renderCurrentStep(); window.scrollTo({ top: 0, behavior: 'smooth' });
}
function showPage(page) {
  if (!state.user && page !== 'auth') page = 'auth';
  ['dashboard', 'wizard', 'history', 'reports', 'report', 'settings', 'auth'].forEach((name) => { const section = el(`page-${name}`); if (section) section.hidden = name !== page; });
  document.querySelectorAll('.nav-link').forEach((button) => button.classList.toggle('active', button.dataset.page === page));
  document.body.classList.remove('mobile-nav-open');
  document.body.classList.toggle('print-report', page === 'report');
  applyLanguage();
}
function clearFormAlert() {
  const alert = el('form-alert');
  if (!alert) return;
  alert.hidden = true; alert.textContent = '';
}
function showFormAlert(message) {
  const alert = el('form-alert');
  if (!alert) { showToast(message); return; }
  alert.textContent = state.settings.language === 'en' ? translateText(message) : message;
  alert.hidden = false;
  alert.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
function showStepError(key, message) {
  const input = document.querySelector(`[data-field="${key}"]`);
  if (input) {
    const wrapper = input.closest('.field');
    if (wrapper) {
      wrapper.classList.add('invalid');
      wrapper.querySelector('.field-error')?.remove();
      const note = document.createElement('small');
      note.className = 'field-error';
      note.textContent = state.settings.language === 'en' ? translateText(message) : message;
      wrapper.appendChild(note);
    }
    try { input.focus({ preventScroll: false }); } catch { input.focus(); }
  }
  showFormAlert(message);
}
function gpsNoticeText(code) {
  const messages = {
    unsupported: ['Ù…ØªØµÙØ­Ùƒ Ù„Ø§ ÙŠØ¯Ø¹Ù… ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…ÙˆÙ‚Ø¹Ø› Ø§Ø¨Ø­Ø« Ø¹Ù† Ù…Ø¯ÙŠÙ†ØªÙƒ Ù…Ù† Ø­Ù‚Ù„ Ø§Ù„Ø¨Ø­Ø« Ø¨Ø§Ù„Ø£Ø³ÙÙ„.', 'Your browser does not support location; search for your city below.'],
    insecure: ['ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…ÙˆÙ‚Ø¹ ÙŠØ­ØªØ§Ø¬ Ø§ØªØµØ§Ù„Ø§Ù‹ Ø¢Ù…Ù†Ø§Ù‹ (HTTPS). Ø§Ø¨Ø­Ø« Ø¹Ù† Ù…Ø¯ÙŠÙ†ØªÙƒ Ù…Ù† Ø­Ù‚Ù„ Ø§Ù„Ø¨Ø­Ø« Ø¨Ø§Ù„Ø£Ø³ÙÙ„.', 'Location needs a secure connection (HTTPS). Search for your city below.'],
    denied: ['ØªÙ… Ø±ÙØ¶ Ø¥Ø°Ù† Ø§Ù„Ù…ÙˆÙ‚Ø¹. ÙØ¹Ù‘Ù„ Ø§Ù„Ø¥Ø°Ù† Ù…Ù† Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù…ØªØµÙØ­ Ø«Ù… Ø£Ø¹Ø¯ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø©ØŒ Ø£Ùˆ Ø§Ø¨Ø­Ø« Ø¹Ù† Ù…Ø¯ÙŠÙ†ØªÙƒ.', 'Location permission was denied. Allow it in your browser settings and retry, or search for your city.'],
    unavailable: ['ØªØ¹Ø°Ø± ØªØ­Ø¯ÙŠØ¯ Ù…ÙˆÙ‚Ø¹Ùƒ Ø§Ù„Ø¢Ù†. Ø¬Ø±Ù‘Ø¨ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰ Ø£Ùˆ Ø§Ø¨Ø­Ø« Ø¹Ù† Ù…Ø¯ÙŠÙ†ØªÙƒ.', 'Could not determine your location now. Try again or search for your city.'],
    timeout: ['Ø§Ø³ØªØºØ±Ù‚ ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…ÙˆÙ‚Ø¹ ÙˆÙ‚ØªØ§Ù‹ Ø·ÙˆÙŠÙ„Ø§Ù‹. Ø¬Ø±Ù‘Ø¨ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰ ÙÙŠ Ù…ÙƒØ§Ù† Ù…ÙƒØ´ÙˆÙ.', 'Locating took too long. Try again in an open area.'],
    busy: ['Ø¬Ø§Ø±Ù ØªØ­Ø¯ÙŠØ¯ Ù…ÙˆÙ‚Ø¹Ùƒ ÙˆØªØ­Ø¯ÙŠØ« Ø§Ù„Ø·Ù‚Ø³â€¦', 'Getting your location and updating weatherâ€¦'],
    granted: ['ØªÙ… ØªØ­Ø¯ÙŠØ¯ Ù…ÙˆÙ‚Ø¹Ùƒ ÙˆØªØ­Ø¯ÙŠØ« Ø§Ù„Ø·Ù‚Ø³ Ø¨Ù†Ø¬Ø§Ø­.', 'Location set and weather updated successfully.'],
  };
  return messages[code] ? ui(...messages[code]) : '';
}
function renderGpsStatus() {
  const node = el('gps-status');
  if (!node) return;
  if (!gpsNotice) { node.hidden = true; node.textContent = ''; node.className = 'gps-status'; return; }
  node.hidden = false;
  node.className = `gps-status gps-${gpsNotice.type}`;
  node.textContent = gpsNoticeText(gpsNotice.code);
}
function setGpsNotice(type, code) { gpsNotice = { type, code }; renderGpsStatus(); }
function validateStep() {
  const f = state.form;
  const invalid = (key, message) => { showStepError(key, message); return false; };
  if (currentStep === 0) {
    if (!f.panels || Number(f.panels) < 1) return invalid('panels', 'Ø£Ø¯Ø®Ù„ Ø¹Ø¯Ø¯ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø£ÙˆÙ„Ø§Ù‹.');
    if (f.ambientTemp !== '' && (Number(f.ambientTemp) < -10 || Number(f.ambientTemp) > 65)) return invalid('ambientTemp', 'ØªØ£ÙƒØ¯ Ù…Ù† Ø¯Ø±Ø¬Ø© Ø­Ø±Ø§Ø±Ø© Ø§Ù„Ø¬Ùˆ.');
    if (f.humidity !== '' && (Number(f.humidity) < 0 || Number(f.humidity) > 100)) return invalid('humidity', 'Ø§Ù„Ø±Ø·ÙˆØ¨Ø© ÙŠØ¬Ø¨ Ø£Ù† ØªÙƒÙˆÙ† Ø¨ÙŠÙ† 0 Ùˆ100%.');
  }
  if (currentStep === 1 && (!f.power || Number(f.power) <= 0)) return invalid('power', 'Ø£Ø¯Ø®Ù„ Ø§Ù„Ù‚Ø¯Ø±Ø© Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠØ© Ù„Ù„Ù†Ø¸Ø§Ù….');
  if (currentStep === 1 && f.tilt !== '' && (!Number.isFinite(Number(f.tilt)) || Number(f.tilt) < 0 || Number(f.tilt) > 90)) return invalid('tilt', 'ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ù„Ù…ÙŠÙ„ Ø¨ÙŠÙ† 0 Ùˆ90 Ø¯Ø±Ø¬Ø©.');
  if (currentStep === 1 && f.panelAzimuth !== '' && (!Number.isFinite(Number(f.panelAzimuth)) || Number(f.panelAzimuth) < 0 || Number(f.panelAzimuth) > 360)) return invalid('panelAzimuth', 'ØªØ£ÙƒØ¯ Ù…Ù† Ø§ØªØ¬Ø§Ù‡ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø¨ÙŠÙ† 0 Ùˆ360 Ø¯Ø±Ø¬Ø©.');
  if (currentStep === 1 && f.captureAt && !captureTimeIso()) return invalid('captureAt', 'ØªØ£ÙƒØ¯ Ù…Ù† ÙˆÙ‚Øª Ø§Ù„ØªØµÙˆÙŠØ±.');
  if (currentStep === 2 && !/^\d{4}-\d{2}$/.test(f.billMonth || '')) return invalid('billMonth', 'ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ù„Ø´Ù‡Ø± ÙˆØ§Ù„Ø£Ø±Ù‚Ø§Ù… Ù‚Ø¨Ù„ Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ÙØ§ØªÙˆØ±Ø©.');
  if (currentStep === 2) for (const key of ['expectedMonthlyKwh', 'actualMonthlyKwh']) { if (f[key] !== '' && (!Number.isFinite(Number(f[key])) || Number(f[key]) < 0)) return invalid(key, 'ØªØ£ÙƒØ¯ Ù…Ù† Ù‚ÙŠÙ…Ø© Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ø§Ù„Ù…ØªÙˆÙ‚Ù‘Ø¹ ÙˆØ§Ù„ÙØ¹Ù„ÙŠ.'); }
  if (currentStep === 2 && f.consumption && !f.invoice) return invalid('invoice', 'Ø£Ø¶Ù Ù‚ÙŠÙ…Ø© Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„ØªØ¹Ø±ÙØ© Ø§Ù„ØªÙ‚Ø±ÙŠØ¨ÙŠØ©.');
  return true;
}
function nextStep() {
  if (!validateStep()) return;
  if (currentStep < 3) {
    if (currentStep === 1 && appSettings && state.form.tilt !== '') {
      const tilt = Number(state.form.tilt);
      if (Number.isFinite(tilt) && (tilt < Number(appSettings.tilt_min_degrees) || tilt > Number(appSettings.tilt_max_degrees))) state.tiltWarningSeenFor = String(state.form.tilt);
    }
    currentStep += 1; persist(); renderCurrentStep(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  else { state.onboarded = true; state.updatedAt = new Date().toISOString(); persist(); showPage('dashboard'); renderDashboard(); runAnalysis({ useClaude: false }); }
}
function previousStep() { if (currentStep > 0) { currentStep -= 1; renderCurrentStep(); } }
async function handleUploads(category, files) {
  const accountId = currentAccount?.id;
  if (!accountId) return showFormAlert('Ø³Ø¬Ù‘Ù„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø£ÙˆÙ„Ø§Ù‹.');
  if (category === 'bill') { invoiceReview = null; invoiceSequence += 1; invoiceController?.abort(); invoiceBusy = false; }
  const chosen = category === 'bill' ? files.slice(0, 1) : files;
  if (category === 'panels' && mediaFor(category).length + chosen.length > 6) { showFormAlert('ÙŠÙ…ÙƒÙ†Ùƒ Ø¥Ø¶Ø§ÙØ© 6 Ù…Ù„ÙØ§Øª ÙƒØ­Ø¯ Ø£Ù‚ØµÙ‰.'); return; }
  for (const file of chosen) {
    const supportedImage = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    const supportedVideo = ['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type);
    if (!supportedImage && !supportedVideo) { showFormAlert('Ø§Ø®ØªØ± JPG Ø£Ùˆ PNG Ø£Ùˆ WEBP Ø£Ùˆ ÙÙŠØ¯ÙŠÙˆ MP4 Ø£Ùˆ WEBM Ø£Ùˆ MOV.'); continue; }
    if (category === 'bill' && !file.type.startsWith('image/')) { showFormAlert('ÙŠÙ…ÙƒÙ† Ø¥Ø±ÙØ§Ù‚ Ø§Ù„ÙØ§ØªÙˆØ±Ø© ÙƒØµÙˆØ±Ø©.'); continue; }
    if (file.size > 25 * 1024 * 1024) { showFormAlert('ÙŠØ¬Ø¨ Ø£Ù„Ø§ ÙŠØªØ¬Ø§ÙˆØ² Ø­Ø¬Ù… Ø§Ù„Ù…Ù„Ù 25 Ù…ÙŠØºØ§Ø¨Ø§ÙŠØª.'); continue; }
    const blob = file.type.startsWith('image/') ? await compressImage(file, category === 'bill' ? 1600 : 1500) : file;
    if (accountId !== currentAccount?.id) return;
    if (category === 'bill') {
      for (const old of mediaFor('bill')) await removeMedia(old.id);
      if (mediaFor('bill').length) return;
    }
    const item = { id: crypto.randomUUID(), accountId, category, name: file.name, type: blob.type || file.type, blob, updatedAt: Date.now() };
    try { await dbRequest('readwrite', (store) => store.put(item)); media.push(item); if (category === 'panels') clearVisualAssessment(); }
    catch { showFormAlert('ØªØ¹Ø°Ø± Ø­ÙØ¸ Ø§Ù„Ù…Ù„Ù Ù…Ø­Ù„ÙŠØ§Ù‹Ø› Ø¬Ø±Ù‘Ø¨ Ù…Ù„ÙØ§Ù‹ Ø£ØµØºØ±.'); }
  }
  if (accountId !== currentAccount?.id) return;
  persist();
  if (currentAccount) await syncAccountMedia().catch((error) => showFormAlert(error.message || 'ØªØ¹Ø°Ø± Ø±ÙØ¹ Ø§Ù„Ù…Ø±ÙÙ‚Ø§ØªØ› Ø­ÙÙØ¸Øª Ø¹Ù„Ù‰ Ù‡Ø°Ø§ Ø§Ù„Ø¬Ù‡Ø§Ø².'));
  renderCurrentStep();
}
function compressImage(file, maxSide) {
  return new Promise((resolve) => {
    const image = new Image(); const url = URL.createObjectURL(file);
    image.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height)); const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height); URL.revokeObjectURL(url);
      canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', .8);
    };
    image.onerror = () => { URL.revokeObjectURL(url); resolve(file); }; image.src = url;
  });
}
async function removeMedia(id) {
  const selected = media.find((item) => item.id === id);
  if (selected?.category === 'bill') { invoiceReview = null; invoiceSequence += 1; invoiceController?.abort(); invoiceBusy = false; }
  if (selected?.cloudSynced && currentAccount) {
    try {
      const response = await authenticatedFetch('/api/account/media/' + encodeURIComponent(id), { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'ØªØ¹Ø°Ø± Ø­Ø°Ù Ø§Ù„Ù…Ø±ÙÙ‚ Ù…Ù† Ø§Ù„Ø­Ø³Ø§Ø¨.');
    } catch (error) { showToast(error.message || 'ØªØ¹Ø°Ø± Ø­Ø°Ù Ø§Ù„Ù…Ø±ÙÙ‚ Ù…Ù† Ø§Ù„Ø­Ø³Ø§Ø¨.'); return; }
  }
  try { await dbRequest('readwrite', (store) => store.delete(id)); } catch { /* remove visible reference anyway */ }
  media = media.filter((item) => item.id !== id); if (selected?.category === 'panels') clearVisualAssessment(); persist(); renderCurrentStep();
}
async function analyzeInvoice() {
  const item = mediaFor('bill')[0];
  if (!item || !currentAccount?.id || invoiceBusy) return;
  const accountId = currentAccount.id;
  invoiceBusy = true; const initialButton = el('analyze-invoice'); if (initialButton) { initialButton.disabled = true; initialButton.setAttribute('aria-busy', 'true'); }
  const config = await loadAiConfig();
  if (accountId !== currentAccount?.id || mediaFor('bill')[0]?.id !== item.id) return;
  if (!config.claudeEnabled) {
    invoiceBusy = false; renderCurrentStep();
    return showToast(claudeEnabled === false ? 'Claude ØºÙŠØ± Ù…ÙØ¹Ù‘Ù„ Ø¨Ø¹Ø¯. ÙŠØ³ØªØ·ÙŠØ¹ Ù…Ø³Ø¤ÙˆÙ„ Ø§Ù„Ù…ÙˆÙ‚Ø¹ ØªÙØ¹ÙŠÙ„Ù‡ Ø¨Ù…ÙØªØ§Ø­ Anthropic.' : 'ØªØ¹Ø°Ø± Ù…Ø¹Ø±ÙØ© Ø­Ø§Ù„Ø© ClaudeØ› Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.');
  }
  invoiceController?.abort(); invoiceController = new AbortController();
  const sequence = ++invoiceSequence;
  const month = state.form.billMonth; const language = state.settings.language;
  invoiceBusy = true; invoiceReview = null; renderCurrentStep();
  try {
    const image = await imageToDataUrl(item.blob, 1800, .83);
    if (sequence !== invoiceSequence || accountId !== currentAccount?.id) return;
    const response = await authenticatedFetch('/api/analyze-invoice', {
      method: 'POST', signal: invoiceController.signal, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image, billMonth: month, language }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(claudeError(data, 'ØªØ¹Ø°Ø± Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ÙØ§ØªÙˆØ±Ø©. Ø¬Ø±Ù‘Ø¨ ØµÙˆØ±Ø© Ø£ÙˆØ¶Ø­.'));
    if (sequence !== invoiceSequence || accountId !== currentAccount?.id || month !== state.form.billMonth || language !== state.settings.language || mediaFor('bill')[0]?.id !== item.id) return;
    if (!data.invoice || typeof data.invoice !== 'object') throw new Error('ØªØ¹Ø°Ø± Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ÙØ§ØªÙˆØ±Ø©. Ø¬Ø±Ù‘Ø¨ ØµÙˆØ±Ø© Ø£ÙˆØ¶Ø­.');
    invoiceReview = { accountId, mediaId: item.id, month, invoice: { ...data.invoice }, model: data.model };
  } catch (error) { if (error.name !== 'AbortError' && sequence === invoiceSequence && accountId === currentAccount?.id) showToast(error.message || 'ØªØ¹Ø°Ø± Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ÙØ§ØªÙˆØ±Ø©. Ø¬Ø±Ù‘Ø¨ ØµÙˆØ±Ø© Ø£ÙˆØ¶Ø­.'); }
  finally { if (sequence === invoiceSequence && accountId === currentAccount?.id) { invoiceBusy = false; if (currentStep === 2 && !el('page-wizard').hidden) renderCurrentStep(); } }
}
function applyInvoiceReview() {
  const draft = invoiceReview;
  if (!draft || draft.accountId !== currentAccount?.id || draft.mediaId !== mediaFor('bill')[0]?.id || draft.month !== state.form.billMonth) { invoiceReview = null; renderCurrentStep(); return; }
  const values = draft.invoice;
  if (String(values.currency || '').trim().toUpperCase() !== 'OMR') return showToast('Ø­Ø³Ø§Ø¨ Ø§Ù„Ù‚ÙŠÙ…Ø© Ù‡Ù†Ø§ ÙŠØ¯Ø¹Ù… Ø§Ù„Ø±ÙŠØ§Ù„ Ø§Ù„Ø¹ÙÙ…Ø§Ù†ÙŠØ› Ø£Ø¯Ø®Ù„ ØªØ¹Ø±ÙØ© Ø¨Ø§Ù„Ø±ÙŠØ§Ù„ Ø§Ù„Ø¹ÙÙ…Ø§Ù†ÙŠ ÙŠØ¯ÙˆÙŠØ§Ù‹ Ù„Ù‡Ø°Ù‡ Ø§Ù„ÙØ§ØªÙˆØ±Ø©.');
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(values.billingMonth || '')) return showToast('ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ù„Ø´Ù‡Ø± ÙˆØ§Ù„Ø£Ø±Ù‚Ø§Ù… Ù‚Ø¨Ù„ Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ÙØ§ØªÙˆØ±Ø©.');
  for (const key of ['totalAmount', 'consumptionKwh', 'energyTariffPerKwh']) {
    if (values[key] !== null && values[key] !== undefined && values[key] !== '' && (!Number.isFinite(Number(values[key])) || Number(values[key]) < 0)) return showToast('ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ù„Ø´Ù‡Ø± ÙˆØ§Ù„Ø£Ø±Ù‚Ø§Ù… Ù‚Ø¨Ù„ Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ÙØ§ØªÙˆØ±Ø©.');
  }
  for (const [source, destination] of [['totalAmount', 'invoice'], ['consumptionKwh', 'consumption'], ['energyTariffPerKwh', 'tariff']]) {
    state.form[destination] = values[source] !== null && values[source] !== undefined && values[source] !== '' ? String(Number(values[source])) : '';
  }
  if (values.billingMonth !== state.form.billMonth) { state.form.expectedMonthlyKwh = ''; state.form.actualMonthlyKwh = ''; }
  state.form.billMonth = values.billingMonth; state.monthlyLoss = null;
  invoiceReview = null; persist(); renderCurrentStep(); showToast('ØªÙ… Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ø§Ù„ØªÙŠ Ø±Ø§Ø¬Ø¹ØªÙ‡Ø§.');
}
function getLocation() {
  const accountId = currentAccount?.id;
  const button = el('gps-button');
  if (!navigator.geolocation) { setGpsNotice('error', 'unsupported'); showFormAlert(gpsNoticeText('unsupported')); return; }
  if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') { setGpsNotice('error', 'insecure'); showFormAlert(gpsNoticeText('insecure')); return; }
  if (!button || button.disabled) return;
  setGpsNotice('busy', 'busy');
  button.textContent = ui('Ø¬Ø§Ø±Ù ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…ÙˆÙ‚Ø¹â€¦', 'Getting locationâ€¦'); button.disabled = true;
  const restoreButton = () => { if (button.isConnected) { button.textContent = ui('âŒ– Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù…ÙˆÙ‚Ø¹Ùƒ Ø§Ù„Ø­Ø§Ù„ÙŠ', 'âŒ– Use your current location'); button.disabled = false; } };
  navigator.geolocation.getCurrentPosition(async (position) => {
    if (accountId !== currentAccount?.id) return;
    clearVisualAssessment();
    state.solarContext = null; state.monthlyLoss = null;
    state.form.latitude = position.coords.latitude; state.form.longitude = position.coords.longitude;
    clearWeatherForLocation();
    state.form.location = `${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}`; persist();
    refreshWeatherFieldChecks();
    if (el('city-search')) el('city-search').value = state.form.location;
    setGpsNotice('ok', 'granted');
    try { await loadWeather({ forcePrefill: true }); } finally { restoreButton(); }
  }, (error) => {
    restoreButton();
    if (accountId !== currentAccount?.id) return;
    const code = error && error.code === 1 ? 'denied' : error && error.code === 3 ? 'timeout' : 'unavailable';
    setGpsNotice('error', code); showFormAlert(gpsNoticeText(code));
  }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 });
}
async function searchCity() {
  const accountId = currentAccount?.id;
  const input = el('city-search'); const results = el('search-results'); const name = input?.value.trim();
  if (!name) return showToast('Ø§ÙƒØªØ¨ Ø§Ø³Ù… Ù…Ø¯ÙŠÙ†Ø© Ù„Ù„Ø¨Ø­Ø«.');
  results.innerHTML = '<small class="helper-text">Ø¬Ø§Ø±Ù Ø§Ù„Ø¨Ø­Ø«â€¦</small>';
  try {
    const response = await fetch(`/api/geocode?name=${encodeURIComponent(name)}`); const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    if (accountId !== currentAccount?.id) return;
    if (!data.results.length) { results.innerHTML = '<small class="helper-text">Ù„Ù… Ù†Ø¹Ø«Ø± Ø¹Ù„Ù‰ Ù†ØªØ§Ø¦Ø¬. Ø¬Ø±Ù‘Ø¨ ÙƒØªØ§Ø¨Ø© Ø§Ù„Ø§Ø³Ù… Ø¨Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©.</small>'; return; }
    results.innerHTML = data.results.map((place, index) => `<button type="button" class="search-result" data-place="${index}">${escapeHtml([place.name, place.admin1, place.country].filter(Boolean).join('ØŒ '))}</button>`).join('');
    results.querySelectorAll('[data-place]').forEach((button) => button.addEventListener('click', async () => {
      if (accountId !== currentAccount?.id) return;
      clearVisualAssessment();
      const place = data.results[Number(button.dataset.place)]; state.form.location = [place.name, place.admin1].filter(Boolean).join('ØŒ '); state.form.latitude = place.latitude; state.form.longitude = place.longitude;
      state.solarContext = null; state.monthlyLoss = null;
      gpsNotice = null;
      clearWeatherForLocation();
      persist(); refreshWeatherFieldChecks(); input.value = state.form.location; results.innerHTML = ''; showToast(`ØªÙ… Ø§Ø®ØªÙŠØ§Ø± ${state.form.location}.`); await loadWeather({ forcePrefill: true });
    }));
  } catch (error) { results.innerHTML = `<small class="helper-text">${escapeHtml(error.message || 'ØªØ¹Ø°Ø± Ø§Ù„Ø¨Ø­Ø«. ØªØ£ÙƒØ¯ Ù…Ù† ØªØ´ØºÙŠÙ„ Ø§Ù„Ø®Ø§Ø¯Ù….')}</small>`; }
}
async function fetchWeatherResponse(url, timeoutMs) {
  // Use a controller and timer so this also works in Safari versions without AbortSignal.timeout.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      const error = new Error('weather_request_failed');
      error.status = response.status;
      throw error;
    }
    const data = await response.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('weather_response_invalid');
    return data;
  } finally { clearTimeout(timer); }
}
function assertWeatherCoordinates(latitude, longitude) {
  const validCoordinate = (value, min, max) => (typeof value === 'number' || typeof value === 'string')
    && String(value).trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= min && Number(value) <= max;
  if (!validCoordinate(latitude, -90, 90) || !validCoordinate(longitude, -180, 180)) throw new Error('Ø¥Ø­Ø¯Ø§Ø«ÙŠØ§Øª Ø§Ù„Ù…ÙˆÙ‚Ø¹ ØºÙŠØ± ØµØ§Ù„Ø­Ø©.');
}
function hasUsableWeatherCurrent(snapshot) {
  const validReading = (value, min, max) => (typeof value === 'number' || typeof value === 'string')
    && String(value).trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= min && Number(value) <= max;
  if (!validReading(snapshot?.current?.temperature_2m, -90, 65)
    || !validReading(snapshot?.current?.relative_humidity_2m, 0, 100)
    || typeof snapshot?.timezone !== 'string' || snapshot.timezone.trim() === '') return false;
  try { new Intl.DateTimeFormat('en', { timeZone: snapshot.timezone }).format(0); return true; }
  catch { return false; }
}
async function fetchDirectAirSnapshot(latitude, longitude) {
  assertWeatherCoordinates(latitude, longitude);
  const airUrl = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
  airUrl.search = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude), timezone: 'auto', timeformat: 'unixtime', current: 'pm10,dust', hourly: 'pm10,dust', forecast_days: '2' });
  try {
    const air = await fetchWeatherResponse(airUrl, 12_000);
    return airborneDustReading({ air: air.current }) ? air : null;
  } catch { return null; }
}
async function fetchDirectWeatherSnapshot(latitude, longitude) {
  assertWeatherCoordinates(latitude, longitude);
  const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast');
  forecastUrl.search = new URLSearchParams({
    latitude: String(latitude), longitude: String(longitude), timezone: 'auto', timeformat: 'unixtime',
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_gusts_10m',
    hourly: 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,sunshine_duration,weather_code',
    forecast_days: '7',
  });
  const [forecast, air] = await Promise.all([
    fetchWeatherResponse(forecastUrl, 12_000),
    // Air-quality availability must not discard temperature, humidity, or weather readings.
    fetchDirectAirSnapshot(latitude, longitude),
  ]);
  if (!hasUsableWeatherCurrent(forecast)) throw new Error('weather_response_invalid');
  const rawDustFlag = forecast.dust_forecast_flag ?? forecast.current?.dust_forecast_flag ?? air?.current?.dust_forecast_flag;
  return {
    current: forecast.current, hourly: forecast.hourly, daily: forecast.daily,
    air: air?.current || null, airHourly: air?.hourly || null, timezone: forecast.timezone,
    dustForecastFlag: typeof rawDustFlag === 'boolean' ? rawDustFlag : null,
    provider: 'Open-Meteo', fetchedAt: new Date().toISOString(), cached: false, cacheAgeSeconds: 0,
  };
}
async function requestWeatherSnapshot(latitude, longitude) {
  assertWeatherCoordinates(latitude, longitude);
  try {
    const snapshot = await fetchWeatherResponse(`/api/weather?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`, 20_000);
    if (!hasUsableWeatherCurrent(snapshot)) throw new Error('weather_response_invalid');
    if (!airborneDustReading(snapshot)) {
      const air = await fetchDirectAirSnapshot(latitude, longitude);
      if (air) {
        const rawDustFlag = snapshot.dustForecastFlag ?? air.current?.dust_forecast_flag;
        return { ...snapshot, air: air.current, airHourly: air.hourly || null,
          airProvider: 'Open-Meteo', airFetchedAt: new Date().toISOString(),
          dustForecastFlag: typeof rawDustFlag === 'boolean' ? rawDustFlag : null };
      }
    }
    return snapshot;
  } catch (error) {
    // A bad request is a coordinate/input issue, not a reason to request another provider path.
    if (error.status === 400) throw new Error('Ø¥Ø­Ø¯Ø§Ø«ÙŠØ§Øª Ø§Ù„Ù…ÙˆÙ‚Ø¹ ØºÙŠØ± ØµØ§Ù„Ø­Ø©.');
    try { return await fetchDirectWeatherSnapshot(latitude, longitude); }
    catch { throw new Error('ØªØ¹Ø°Ø± Ø¬Ù„Ø¨ Ø§Ù„Ø·Ù‚Ø³ Ø§Ù„Ø¢Ù†. Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰ Ø¨Ø¹Ø¯ Ù‚Ù„ÙŠÙ„ Ø£Ùˆ Ø£Ø¯Ø®Ù„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙŠØ¯ÙˆÙŠÙ‹Ø§.'); }
  }
}
function renderWeatherStatus() {
  const node = el('weather-status');
  if (!node) return;
  if (weatherNotice) { node.className = `weather-status status-${weatherNotice.type}`; node.textContent = weatherNotice.message; return; }
  node.className = 'weather-status';
  if (state.weather?.fetchedAt) {
    const locale = state.settings.language === 'en' ? 'en-OM' : 'ar-OM';
    const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(state.weather.fetchedAt));
    node.textContent = ui(`Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ« Ù„Ù„Ø·Ù‚Ø³ ${time}${state.weather.cached ? ' (Ù†Ø³Ø®Ø© Ù…Ø­ÙÙˆØ¸Ø©)' : ''}.`, `Weather updated ${time}${state.weather.cached ? ' (cached)' : ''}.`);
  } else if (state.form.latitude !== null && state.form.latitude !== '' && state.form.longitude !== null && state.form.longitude !== '') {
    node.textContent = ui('Ù„Ù… ÙŠØªÙ… Ø¬Ù„Ø¨ Ø§Ù„Ø·Ù‚Ø³ Ø¨Ø¹Ø¯Ø› Ø§Ø¶ØºØ· Â«ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø·Ù‚Ø³Â».', 'Weather has not been fetched yet; press â€œUpdate weatherâ€.');
  } else {
    node.textContent = ui('Ø­Ø¯Ù‘Ø¯ Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ù†Ø¸Ø§Ù… Ù„Ø¬Ù„Ø¨ Ø§Ù„Ø·Ù‚Ø³ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹.', 'Set the system location to fetch weather automatically.');
  }
}
async function loadWeather({ forcePrefill = false } = {}) {
  const { latitude, longitude } = state.form;
  const accountId = currentAccount?.id;
  if (latitude === null || longitude === null || latitude === '' || longitude === '' || !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
    weatherNotice = { type: 'error', message: ui('Ø­Ø¯Ù‘Ø¯ Ù…Ø¯ÙŠÙ†Ø© Ø£Ùˆ Ø§Ø³ØªØ®Ø¯Ù… GPS Ø£ÙˆÙ„Ø§Ù‹.', 'Choose a city or use GPS first.') };
    renderWeatherStatus(); showToast(ui('Ø­Ø¯Ù‘Ø¯ Ù…Ø¯ÙŠÙ†Ø© Ø£Ùˆ Ø§Ø³ØªØ®Ø¯Ù… GPS Ø£ÙˆÙ„Ø§Ù‹.', 'Choose a city or use GPS first.')); return;
  }
  const requestId = ++weatherSequence;
  const refreshButton = el('refresh-weather');
  if (refreshButton) { refreshButton.disabled = true; refreshButton.setAttribute('aria-busy', 'true'); }
  weatherNotice = { type: 'loading', message: ui('Ø¬Ø§Ø±Ù ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø·Ù‚Ø³â€¦', 'Updating weatherâ€¦') };
  renderWeatherStatus();
  const before = Object.fromEntries(Object.keys(DEFAULT_STATE.weatherPrefill).map((key) => [key, state.form[key]]));
  const beforeMarkers = { ...state.weatherPrefill };
  try {
    const data = await requestWeatherSnapshot(latitude, longitude);
    if (requestId !== weatherSequence || accountId !== currentAccount?.id || String(latitude) !== String(state.form.latitude) || String(longitude) !== String(state.form.longitude)) return;
    state.weather = data;
    const fetchedAt = new Date().toISOString();
    const assignWeatherField = (key, raw, manualKey, source, min, max, precision = 0) => {
      // Edits made while the request was in flight take precedence over the response.
      const changedDuringFetch = String(state.form[key]) !== String(before[key]) || state.weatherPrefill[key] !== beforeMarkers[key];
      if (changedDuringFetch || (!forcePrefill && state.form[manualKey])) return;
      const number = raw === null || raw === undefined || raw === '' ? NaN : Number(raw);
      if (!Number.isFinite(number) || number < min || number > max) {
        state.form[key] = key === 'airDustPercent' ? null : '';
        state.weatherPrefill[key] = null;
        return;
      }
      const scale = 10 ** precision;
      const value = String(Math.round(number * scale) / scale);
      if (String(state.form[key]) !== value && key === 'ambientTemp') { clearVisualAssessment(); state.solarContext = null; state.monthlyLoss = null; }
      state.form[key] = value; state.form[manualKey] = false;
      state.weatherPrefill[key] = { value, source, fetchedAt, latitude, longitude };
    };
    assignWeatherField('ambientTemp', data.current?.temperature_2m, 'ambientTempManual', 'temperature_2m', -90, 65, 1);
    assignWeatherField('humidity', data.current?.relative_humidity_2m, 'humidityManual', 'relative_humidity_2m', 0, 100);
    const dustReading = airborneDustReading(data);
    assignWeatherField('airDustPercent', dustReading?.percent, 'airDustManual', dustReading?.source, 0, 100);
    const code = data.current?.weather_code;
    state.form.weatherCode = code !== null && code !== undefined && Number.isFinite(Number(code)) ? Number(code) : null;
    weatherNotice = null;
    persist();
    if (!el('page-wizard').hidden && currentStep === 0) renderCurrentStep();
    renderDashboard();
  } catch (error) {
    if (requestId === weatherSequence && accountId === currentAccount?.id) {
      const message = error.message || ui('ØªØ¹Ø°Ø± ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø·Ù‚Ø³.', 'Could not update weather.');
      weatherNotice = { type: 'error', message: `${message} ${ui('ÙŠÙ…ÙƒÙ†Ùƒ Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ø£Ùˆ Ø¥Ø¯Ø®Ø§Ù„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙŠØ¯ÙˆÙŠØ§Ù‹.', 'You can retry or enter the data manually.')}` };
      renderWeatherStatus(); showToast(message);
    }
  } finally {
    if (requestId === weatherSequence && refreshButton?.isConnected) { refreshButton.disabled = false; refreshButton.removeAttribute('aria-busy'); }
  }
}
function weatherText(code) {
  if (code === 0) return 'Ø³Ù…Ø§Ø¡ ØµØ§ÙÙŠØ©'; if ([1, 2, 3].includes(code)) return 'ØºØ§Ø¦Ù… Ø¬Ø²Ø¦ÙŠØ§Ù‹'; if ([45, 48].includes(code)) return 'Ø¶Ø¨Ø§Ø¨';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Ø±Ø°Ø§Ø°'; if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Ø£Ù…Ø·Ø§Ø±';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Ø«Ù„ÙˆØ¬'; if ([95, 96, 99].includes(code)) return 'Ø¹ÙˆØ§ØµÙ Ø±Ø¹Ø¯ÙŠØ©'; return 'Ø­Ø§Ù„Ø© Ù…ØªØºÙŠØ±Ø©';
}
function calculateLoss() {
  const f = state.form; const current = state.weather?.current || {};
  const temperatureValue = f.ambientTemp !== '' && f.ambientTemp !== null && f.ambientTemp !== undefined ? f.ambientTemp : current.temperature_2m;
  const rawAirTemp = temperatureValue !== null && temperatureValue !== undefined && temperatureValue !== '' ? Number(temperatureValue) : NaN;
  const airTemp = Number.isFinite(rawAirTemp) ? rawAirTemp : null;
  const panelOffset = Number(appSettings?.panel_temperature_offset_c);
  const heatThreshold = Number(appSettings?.heat_loss_threshold_c);
  const lossPerDegree = Number(appSettings?.heat_loss_percent_per_c);
  const heatPercent = airTemp !== null && [panelOffset, heatThreshold, lossPerDegree].every(Number.isFinite)
    ? Math.max(0, airTemp + panelOffset - heatThreshold) * lossPerDegree : null;
  // Dust and shade are estimates: dust from the visible coverage (or a scaled airborne
  // index), shade from the visible coverage. Neither is a direct electrical measurement.
  const visual = state.ai && state.aiLanguage === state.settings.language ? state.ai : null;
  const clampPercent = (value) => (value === null || value === undefined || value === '' || !Number.isFinite(Number(value))) ? null : Math.min(100, Math.max(0, Number(value)));
  const visualDust = clampPercent(visual?.dustCoveragePercent);
  const visualShade = clampPercent(visual?.shadeCoveragePercent);
  const manualPanelDust = clampPercent(f.dust);
  const airDustIndex = clampPercent(f.airDustPercent);
  const dustPercent = visualDust !== null ? visualDust
    : manualPanelDust !== null ? manualPanelDust
    : airDustIndex !== null ? Math.round(airDustIndex * 0.25) : null;
  const shadePercent = visualShade !== null ? visualShade : 0;
  const totalPercent = Math.min(100, Math.round((heatPercent || 0) + (dustPercent || 0) + shadePercent));
  const sunshineSeconds = Number(state.weather?.daily?.sunshine_duration?.[0]);
  const sunHours = sunshineSeconds > 0 ? Math.min(8.5, Math.max(3, sunshineSeconds / 3600)) : 5.2;
  const possibleKwh = Math.max(0, Number(f.power || 0) / 1000 * sunHours * .78);
  const lostKwh = possibleKwh * (totalPercent / 100);
  const consumption = Number(f.consumption || 0); const bill = Number(f.invoice || 0); const tariff = Number(f.tariff || 0);
  const price = tariff > 0 ? tariff : consumption > 0 && bill > 0 ? bill / consumption : .025;
  const priceBasis = tariff > 0 ? 'Ø§Ù„ØªØ¹Ø±ÙØ© Ø§Ù„ØªÙŠ Ø£Ø¯Ø®Ù„ØªÙ‡Ø§' : consumption > 0 && bill > 0 ? 'Ù…Ø´ØªÙ‚Ø© Ù…Ù† Ø§Ù„ÙØ§ØªÙˆØ±Ø© ÙˆØ§Ù„Ø§Ø³ØªÙ‡Ù„Ø§Ùƒ' : 'ØªØ¹Ø±ÙØ© Ù…Ø±Ø¬Ø¹ÙŠØ© Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„ØªØºÙŠÙŠØ±';
  return { percent: totalPercent, totalPercent, heatPercent, heatEstimateUnavailable: heatPercent === null, soilingPercent: dustPercent, dustPercent, shadePercent, possibleKwh, lostKwh, lostMoney: lostKwh * price, priceBasis, sunHours, airTemp, tariffOmrPerKwh: price };
}
function applyStoredReport(result, report) {
  result.reportId = report.id;
  result.dustLossPercent = report.dust_loss_percent;
  result.dustLossOmr = report.dust_loss_omr;
  result.heatLossPercent = report.heat_loss_percent;
  result.heatLossOmr = report.heat_loss_omr;
  result.reportAmbientTempC = report.ambient_temp_c;
  result.reportTemperatureSource = report.temperature_source;
  result.monthlyProductionKwh = report.monthly_production_kwh;
  result.heatPercent = report.heat_loss_percent;
  result.heatEstimateUnavailable = report.heat_loss_percent === null || report.heat_loss_percent === undefined;
  result.soilingPercent = report.dust_loss_percent === null || report.dust_loss_percent === undefined ? null : Number(report.dust_loss_percent);
  if (report.ambient_temp_c !== null && Number.isFinite(Number(report.ambient_temp_c))) result.airTemp = Number(report.ambient_temp_c);
  const heatPct = report.heat_loss_percent === null || report.heat_loss_percent === undefined ? null : Number(report.heat_loss_percent);
  const dustPct = result.soilingPercent;
  const shadePct = Number.isFinite(Number(result.shadePercent)) ? Number(result.shadePercent) : 0;
  result.heatPercent = heatPct;
  result.dustPercent = dustPct;
  result.shadePercent = shadePct;
  result.totalPercent = Math.min(100, Math.round((heatPct || 0) + (dustPct || 0) + shadePct));
  result.percent = result.totalPercent;
  result.lostKwh = result.possibleKwh * (result.totalPercent / 100);
  result.lostMoney = result.lostKwh * result.tariffOmrPerKwh;
}
function waitForVideoEvent(video, eventName) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => finish(new Error('ØªØ¹Ø°Ø± ÙØªØ­ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„Ù…ØªØµÙØ­Ø› Ø¬Ø±Ù‘Ø¨ MP4 Ø£Ùˆ Ø£Ø±ÙÙ‚ ØµÙˆØ±Ø§Ù‹ Ù…Ù† Ø§Ù„Ù…Ù‚Ø·Ø¹.')), 12000);
    const success = () => finish();
    const error = () => finish(new Error('ØªØ¹Ø°Ø± ÙØªØ­ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„Ù…ØªØµÙØ­Ø› Ø¬Ø±Ù‘Ø¨ MP4 Ø£Ùˆ Ø£Ø±ÙÙ‚ ØµÙˆØ±Ø§Ù‹ Ù…Ù† Ø§Ù„Ù…Ù‚Ø·Ø¹.'));
    function finish(failure) { clearTimeout(timeout); video.removeEventListener(eventName, success); video.removeEventListener('error', error); failure ? reject(failure) : resolve(); }
    video.addEventListener(eventName, success, { once: true }); video.addEventListener('error', error, { once: true });
  });
}
async function framesFromVideo(blob, count, mediaId) {
  const url = URL.createObjectURL(blob); const video = document.createElement('video'); video.muted = true; video.playsInline = true; video.preload = 'metadata'; video.src = url;
  try {
    if (video.readyState < 1) await waitForVideoEvent(video, 'loadedmetadata');
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0 || !video.videoWidth || !video.videoHeight) throw new Error('ØªØ¹Ø°Ø± ÙØªØ­ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„Ù…ØªØµÙØ­Ø› Ø¬Ø±Ù‘Ø¨ MP4 Ø£Ùˆ Ø£Ø±ÙÙ‚ ØµÙˆØ±Ø§Ù‹ Ù…Ù† Ø§Ù„Ù…Ù‚Ø·Ø¹.');
    const times = Array.from({ length: count }, (_, index) => duration * (index + .5) / count);
    const frames = [];
    for (const time of times) {
      const seek = waitForVideoEvent(video, 'seeked');
      video.currentTime = time;
      await seek;
      const scale = Math.min(1, 1100 / Math.max(video.videoWidth, video.videoHeight)); const canvas = document.createElement('canvas');
      canvas.width = Math.round(video.videoWidth * scale); canvas.height = Math.round(video.videoHeight * scale);
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height); frames.push({ image: canvas.toDataURL('image/jpeg', .68), timeSeconds: Math.round(time * 1000) / 1000, mediaId });
    }
    return frames;
  } finally { URL.revokeObjectURL(url); video.removeAttribute('src'); video.load(); }
}
async function imageToDataUrl(blob, maxSide = 1100, quality = .72) {
  const image = new Image(); const url = URL.createObjectURL(blob);
  try {
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = url; });
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height)); const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale); canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', quality);
  } finally { URL.revokeObjectURL(url); }
}
async function collectFrames() {
  const files = mediaFor('panels').slice(0, 6);
  const videos = files.filter((item) => item.type.startsWith('video/'));
  const pictures = files.filter((item) => item.type.startsWith('image/'));
  const images = []; const frames = []; const failures = [];
  for (const item of pictures) {
    try { images.push(await imageToDataUrl(item.blob)); } catch { failures.push(item.name); }
  }
  const budget = 8 - pictures.length;
  for (const [index, item] of videos.entries()) {
    const count = Math.floor(budget / videos.length) + (index < budget % videos.length ? 1 : 0);
    try { frames.push(...await framesFromVideo(item.blob, Math.max(1, count), item.id)); } catch { failures.push(item.name); }
  }
  if (!images.length && !frames.length) throw new Error('Ù„Ø§ ØªÙˆØ¬Ø¯ Ù„Ù‚Ø·Ø§Øª Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„ØªØ­Ù„ÙŠÙ„Ø› Ø£Ø±ÙÙ‚ ØµÙˆØ±Ø© ÙˆØ§Ø¶Ø­Ø© Ø£Ùˆ ÙÙŠØ¯ÙŠÙˆ Ù…Ø¯Ø¹ÙˆÙ…Ø§Ù‹.');
  return { images, frames, failures };
}
function analysisFacts(result = calculateLoss()) {
  const f = state.form;
  const optional = (value) => value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value)) ? Number(value) : null;
  return {
    panelCount: optional(f.panels), systemPowerWatts: optional(f.power), ambientTemperatureC: result.airTemp,
    humidityPercent: optional(f.humidity) ?? optional(state.weather?.current?.relative_humidity_2m),
    latitude: optional(f.latitude), longitude: optional(f.longitude), tilt: optional(f.tilt), panelAzimuthDegrees: optional(f.panelAzimuth),
    captureAt: captureTimeIso(), timezone: state.weather?.timezone || '', coefficient: optional(f.coefficient),
  };
}
function monthlyReportInput(result = calculateLoss()) {
  const f = state.form; const optional = (value) => value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value)) ? Number(value) : null;
  return {
    month: f.billMonth, billMonth: f.billMonth, tariff: optional(f.tariff),
    expectedMonthlyKwh: optional(f.expectedMonthlyKwh), actualMonthlyKwh: optional(f.actualMonthlyKwh),
    latitude: optional(f.latitude), longitude: optional(f.longitude), ambientTempC: result.airTemp,
    monthlyProductionKwh: result.possibleKwh * 30, tariffOmrPerKwh: result.tariffOmrPerKwh,
    dustLossPercent: result.soilingPercent, location: f.location,
  };
}
function claudeError(data, fallback) {
  const messages = {
    claude_config: ['Ø¥Ø¹Ø¯Ø§Ø¯ Ø®Ø¯Ù…Ø© Claude ØºÙŠØ± ØµØ§Ù„Ø­Ø› ÙŠØ­ØªØ§Ø¬ Ù…Ø³Ø¤ÙˆÙ„ Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ù…Ø±Ø§Ø¬Ø¹ØªÙ‡.', 'Claude configuration is invalid; the site administrator needs to check it.'],
    claude_not_configured: ['Claude ØºÙŠØ± Ù…ÙØ¹Ù‘Ù„ Ø¨Ø¹Ø¯. ÙŠØ³ØªØ·ÙŠØ¹ Ù…Ø³Ø¤ÙˆÙ„ Ø§Ù„Ù…ÙˆÙ‚Ø¹ ØªÙØ¹ÙŠÙ„Ù‡ Ø¨Ù…ÙØªØ§Ø­ Anthropic.', 'Claude is not enabled yet. The site administrator can enable it with an Anthropic key.'],
    claude_billing: ['ÙŠÙ„Ø²Ù… ØªÙØ¹ÙŠÙ„ Ø±ØµÙŠØ¯ Ø®Ø¯Ù…Ø© Claude Ù„Ø¯Ù‰ Ù…Ø³Ø¤ÙˆÙ„ Ø§Ù„Ù…ÙˆÙ‚Ø¹.', 'The site administrator needs to activate Claude API credits.'],
    claude_auth: ['ØªØ¹Ø°Ø± Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø­Ø³Ø§Ø¨ ClaudeØ› ÙŠØ­ØªØ§Ø¬ Ù…Ø³Ø¤ÙˆÙ„ Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ø±Ø¨Ø·.', 'Could not authenticate Claude; the site administrator needs to check the connection.'],
    claude_rate_limit: ['Ø®Ø¯Ù…Ø© Claude Ù…Ø´ØºÙˆÙ„Ø©Ø› Ø§Ù†ØªØ¸Ø± Ù‚Ù„ÙŠÙ„Ø§Ù‹ Ø«Ù… Ø£Ø¹Ø¯ Ø§Ù„ØªØ­Ù„ÙŠÙ„.', 'Claude is busy; wait a little and try again.'],
    claude_timeout: ['Ø§Ø³ØªØºØ±Ù‚ Claude ÙˆÙ‚ØªØ§Ù‹ Ø·ÙˆÙŠÙ„Ø§Ù‹Ø› Ø£Ø¹Ø¯ Ø§Ù„Ø·Ù„Ø¨ Ø£Ùˆ Ø£Ø±ÙÙ‚ ØµÙˆØ±Ø§Ù‹ Ø£ÙˆØ¶Ø­.', 'Claude took too long; retry or attach clearer photos.'],
    claude_refusal: ['Ù„Ù… ÙŠØ³ØªØ·Ø¹ Claude ØªÙ‚Ø¯ÙŠÙ… Ù‡Ø°Ø§ Ø§Ù„ØªØ­Ù„ÙŠÙ„Ø› Ø£Ø±ÙÙ‚ ØµÙˆØ± Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø£Ùˆ Ø§Ù„ÙØ§ØªÙˆØ±Ø© ÙÙ‚Ø·.', 'Claude could not provide this assessment; attach only panel or bill images.'],
    claude_invalid_output: ['Ù„Ù… ÙŠØµÙ„ ØªØ­Ù„ÙŠÙ„ Ù…ÙƒØªÙ…Ù„ Ù…Ù† ClaudeØ› Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.', 'Claude did not return a complete assessment; try again.'],
    claude_image_size: ['Ø§Ù„ØµÙˆØ±Ø© ÙƒØ¨ÙŠØ±Ø© Ù„Ù„ØªØ­Ù„ÙŠÙ„Ø› Ø¬Ø±Ù‘Ø¨ ØµÙˆØ±Ø© Ø£ØµØºØ± Ø£Ùˆ Ø£Ù‚Ù„ Ø¯Ù‚Ø©.', 'The image is too large for assessment; try a smaller or lower-resolution image.'],
    claude_image_format: ['ØªØ¹Ø°Ø± Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ØµÙˆØ±Ø©Ø› Ø§Ø³ØªØ®Ø¯Ù… JPG Ø£Ùˆ PNG Ø£Ùˆ WEBP.', 'Could not read the image; use JPG, PNG or WEBP.'],
    claude_images_required: ['Ø£Ø±ÙÙ‚ ØµÙˆØ±Ø© ÙˆØ§Ø¶Ø­Ø© Ø£Ùˆ ÙÙŠØ¯ÙŠÙˆ Ù…Ø¯Ø¹ÙˆÙ…Ø§Ù‹ Ù‚Ø¨Ù„ Ø§Ù„ØªØ­Ù„ÙŠÙ„.', 'Attach a clear image or supported video before assessment.'],
    claude_frame_time: ['ØªØ¹Ø°Ø± Ù‚Ø±Ø§Ø¡Ø© ØªÙˆÙ‚ÙŠØª Ù„Ù‚Ø·Ø© Ø§Ù„ÙÙŠØ¯ÙŠÙˆØ› Ø£Ø¹Ø¯ Ø¥Ø±ÙØ§Ù‚ Ø§Ù„Ù…Ù‚Ø·Ø¹.', 'Could not read a video frame timestamp; attach the clip again.'],
    claude_model: ['Ù†Ù…ÙˆØ°Ø¬ Claude Ø§Ù„Ù…Ø­Ø¯Ø¯ ØºÙŠØ± Ù…ØªØ§Ø­Ø› ÙŠØ­ØªØ§Ø¬ Ù…Ø³Ø¤ÙˆÙ„ Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯.', 'The selected Claude model is unavailable; the site administrator needs to check it.'],
    claude_request: ['ØªØ¹Ø°Ø± ØªÙ†ÙÙŠØ° Ø·Ù„Ø¨ ClaudeØ› Ø¬Ø±Ù‘Ø¨ ØµÙˆØ±Ø© Ø£ÙˆØ¶Ø­ Ø£Ùˆ Ø£Ø¹Ø¯ Ø§Ù„Ø·Ù„Ø¨.', 'Could not process the Claude request; try a clearer image or submit again.'],
    claude_unavailable: ['Ø®Ø¯Ù…Ø© Claude ØºÙŠØ± Ù…ØªØ§Ø­Ø© Ø§Ù„Ø¢Ù†Ø› Ø­Ø§ÙˆÙ„ Ù„Ø§Ø­Ù‚Ø§Ù‹.', 'Claude is unavailable right now; try later.'],
    claude_network: ['ØªØ¹Ø°Ø± Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø®Ø¯Ù…Ø© ClaudeØ› Ø­Ø§ÙˆÙ„ Ù„Ø§Ø­Ù‚Ø§Ù‹.', 'Could not connect to Claude; try later.'],
  };
  return messages[data.code] ? ui(...messages[data.code]) : state.settings.language === 'en' ? translateText(data.error || fallback) : data.error || fallback;
}
async function requestMonthlyAssessment(signal) {
  const response = await authenticatedFetch('/api/monthly-loss', {
    method: 'POST', signal, headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ facts: analysisFacts(), reportInput: monthlyReportInput(), language: state.settings.language }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || ui('ØªØ¹Ø°Ø± Ø­Ø³Ø§Ø¨ Ø®Ø³Ø§Ø±Ø© Ø§Ù„Ø´Ù‡Ø±.', 'Could not calculate monthly losses.'));
  return data;
}
async function updateMonthlyAssessment() {
  if (!currentAccount?.id) return;
  const selectedMonth = el('dashboard-bill-month').value;
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(selectedMonth) && selectedMonth !== state.form.billMonth) {
    state.form.billMonth = selectedMonth; state.form.expectedMonthlyKwh = ''; state.form.actualMonthlyKwh = ''; state.monthlyLoss = null; invoiceReview = null; persist();
  }
  const button = el('update-monthly-loss'); if (button) button.disabled = true;
  const accountId = currentAccount.id; const fingerprint = analysisFingerprint();
  try {
    const data = await requestMonthlyAssessment();
    if (accountId !== currentAccount?.id || fingerprint !== analysisFingerprint()) return;
    state.monthlyLoss = data.monthlyLoss || null; state.solarContext = data.solarContext || null;
    persist(); renderDashboard();
  } catch (error) { if (accountId === currentAccount?.id) showToast(error.message); }
  finally { if (button?.isConnected) button.disabled = false; }
}
async function runAnalysis({ useClaude = false } = {}) {
  if (!currentAccount?.id) return;
  analysisController?.abort(); analysisController = new AbortController();
  analysisBusy = useClaude;
  const panelButton = el('analyze-panels'); if (panelButton) panelButton.textContent = ui('ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Claude', 'Panel assessment with Claude');
  const sequence = ++analysisSequence; const accountId = currentAccount.id; const fingerprint = analysisFingerprint();
  const stillCurrent = () => sequence === analysisSequence && accountId === currentAccount?.id && fingerprint === analysisFingerprint();
  const button = useClaude ? el('analyze-panels') : el('start-setup'); const original = button?.innerHTML;
  if (button) { button.disabled = true; button.innerHTML = `<span class="loading-inline"><i class="spinner"></i> ${ui('ÙŠØ¬Ø±ÙŠ Ø§Ù„ØªØ­Ù„ÙŠÙ„â€¦', 'Assessingâ€¦')}</span>`; }
  el('status-title').textContent = ui('Ø³ÙŠØ§Ø¬ ÙŠØ±Ø§Ø¬Ø¹ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª', 'Siyaj is reviewing your details');
  let analysisError = ''; let storedReport = null; let ai = null; let aiModel = null; let solarContext = null; let monthlyLoss = null;
  try {
    await loadAppSettings(); const config = await loadAiConfig();
    if (!stillCurrent()) return;
    const baseResult = calculateLoss();
    if (useClaude && mediaFor('panels').length && config.claudeEnabled) {
      try {
        const collected = await collectFrames();
        if (!stillCurrent()) return;
        const response = await authenticatedFetch('/api/analyze', {
          method: 'POST', signal: analysisController.signal, headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: collected.images, frames: collected.frames, language: state.settings.language, facts: analysisFacts(baseResult), reportInput: monthlyReportInput(baseResult) }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(claudeError(data, 'ØªØ¹Ø°Ø± Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø°ÙƒÙŠ.'));
        ai = data.analysis; aiModel = data.model || 'Claude'; storedReport = data.report || null;
        solarContext = data.solarContext || null; monthlyLoss = data.monthlyLoss || null;
        if (collected.failures.length) analysisError = ui(`Ù„Ù… ØªÙÙ‚Ø±Ø£ Ù‡Ø°Ù‡ Ø§Ù„Ù…Ø±ÙÙ‚Ø§Øª: ${collected.failures.join('ØŒ ')}. ØªÙ… ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ù…Ø±ÙÙ‚Ø§Øª Ø§Ù„Ù…ØªØ§Ø­Ø© ÙÙ‚Ø·.`, `These attachments could not be read: ${collected.failures.join(', ')}. Only readable attachments were assessed.`);
      } catch (error) { if (error.name === 'AbortError') return; analysisError = error.message || 'ØªØ¹Ø°Ø± ØªØ­Ù„ÙŠÙ„ Ø§Ù„ØµÙˆØ±.'; }
    } else if (useClaude) analysisError = config.claudeEnabled ? 'Ø£Ø¶Ù ØµÙˆØ±Ø© Ø£Ùˆ ÙÙŠØ¯ÙŠÙˆ Ù„Ù„Ø£Ù„ÙˆØ§Ø­ Ù„ØªÙØ¹ÙŠÙ„ Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø¨ØµØ±ÙŠ Ø¨Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ.' : claudeEnabled === false ? 'Claude ØºÙŠØ± Ù…ÙØ¹Ù‘Ù„ Ø¨Ø¹Ø¯. ÙŠØ³ØªØ·ÙŠØ¹ Ù…Ø³Ø¤ÙˆÙ„ Ø§Ù„Ù…ÙˆÙ‚Ø¹ ØªÙØ¹ÙŠÙ„Ù‡ Ø¨Ù…ÙØªØ§Ø­ Anthropic.' : 'ØªØ¹Ø°Ø± Ù…Ø¹Ø±ÙØ© Ø­Ø§Ù„Ø© ClaudeØ› Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.';
    if (!stillCurrent()) { if (accountId === currentAccount?.id) showToast('ØªØºÙŠØ±Øª Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„ØªØ­Ù„ÙŠÙ„. Ø£Ø¹Ø¯ Ø§Ù„Ø·Ù„Ø¨ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ø§Ù„ÙŠØ©.'); return; }
    if (!monthlyLoss) {
      try { const data = await requestMonthlyAssessment(analysisController.signal); solarContext = data.solarContext || solarContext; monthlyLoss = data.monthlyLoss || null; }
      catch (error) { if (error.name === 'AbortError') return; analysisError += ` ${error.message}`; }
    }
    if (!stillCurrent()) return;
    const result = calculateLoss();
    if (storedReport?.id) applyStoredReport(result, storedReport);
    else {
      try {
        const response = await authenticatedFetch('/api/panel/analysis', { method: 'POST', signal: analysisController.signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(monthlyReportInput(result)) });
        const data = await response.json(); if (!response.ok) throw new Error(data.error || 'ØªØ¹Ø°Ø± Ø­Ø³Ø§Ø¨ ØªÙØµÙŠÙ„ Ø®Ø³Ø§Ø±Ø© Ø§Ù„Ø­Ø±Ø§Ø±Ø© Ø­Ø§Ù„ÙŠØ§Ù‹.');
        if (data.analysis) applyStoredReport(result, data.analysis);
      } catch (error) { if (error.name === 'AbortError') return; result.heatLossPercent = null; result.heatLossOmr = null; result.dustLossOmr = null; if (!analysisError) analysisError = error.message; }
    }
    if (!stillCurrent()) return;
    state.ai = ai; state.aiLanguage = ai ? state.settings.language : null; state.aiModel = aiModel;
    state.solarContext = solarContext; state.monthlyLoss = monthlyLoss; state.result = result; state.updatedAt = new Date().toISOString();
    const item = { ...result, id: crypto.randomUUID(), createdAt: state.updatedAt, temperature: result.airTemp, location: state.form.location || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯', ai: !!ai, visualAssessment: ai, aiLanguage: state.aiLanguage, aiModel, solarContext, monthlyLoss };
    state.history.unshift(item); state.history = state.history.slice(0, 50);
    renderDashboard(analysisError); persist();
  } finally {
    if (sequence === analysisSequence && accountId === currentAccount?.id) {
      analysisBusy = false;
      if (button) { button.disabled = false; button.innerHTML = original || (useClaude ? ui('ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Claude', 'Panel assessment with Claude') : 'Ø¥Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ù†Ø¸Ø§Ù… <span>â†</span>'); }
      if (panelButton) panelButton.disabled = claudeEnabled !== true || !mediaFor('panels').length;
      if (!stillCurrent()) renderDashboard(ui('ØªØºÙŠØ±Øª Ø§Ù„Ø¨ÙŠØ§Ù†Ø§ØªØ› Ø£Ø¹Ø¯ Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø¥Ø°Ø§ Ø£Ø±Ø¯Øª Ù†ØªÙŠØ¬Ø© Ù…Ø­Ø¯Ø«Ø©.', 'Details changed; run analysis again for an updated assessment.'));
    }
  }
}
function money(value) { return `${Number(value || 0).toFixed(3)} Ø±.Ø¹`; }
function assessmentValue(value, suffix = '', decimals = 1) {
  return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) ? `${Number(value).toFixed(decimals)}${suffix}` : 'â€”';
}
function confidenceText(value) {
  return ({ high: ui('Ù…Ø±ØªÙØ¹Ø©', 'High'), medium: ui('Ù…ØªÙˆØ³Ø·Ø©', 'Medium'), low: ui('Ù…Ù†Ø®ÙØ¶Ø©', 'Low'), unavailable: ui('ØºÙŠØ± Ù…ØªØ§Ø­Ø©', 'Unavailable') })[value] || ui('ØºÙŠØ± Ù…Ø­Ø¯Ø¯Ø©', 'Not specified');
}
function assessmentMetric(label, value, hint = '') {
  return `<div class="assessment-metric"><small>${escapeHtml(label)}</small><b>${escapeHtml(value)}</b>${hint ? `<span>${escapeHtml(hint)}</span>` : ''}</div>`;
}
function assessmentNote(key) {
  const notes = {
    missing_location: ['Ø£Ø¶Ù Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ù†Ø¸Ø§Ù… Ù„Ø­Ø³Ø§Ø¨ Ø§ØªØ¬Ø§Ù‡ Ø§Ù„Ø´Ù…Ø³.', 'Add the system location to calculate sun direction.'],
    missing_capture_time_with_timezone: ['Ø£Ø¶Ù ÙˆÙ‚Øª Ø§Ù„ØªØµÙˆÙŠØ± Ù„Ø­Ø³Ø§Ø¨ Ù…ÙˆØ¶Ø¹ Ø§Ù„Ø´Ù…Ø³.', 'Add the capture time to calculate the sun position.'],
    missing_measured_panel_tilt: ['Ø£Ø¯Ø®Ù„ Ù…ÙŠÙ„ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø§Ù„Ù…Ù‚Ø§Ø³Ø› Ù„Ø§ Ù†Ø³ØªØ®Ø±Ø¬Ù‡ Ø¨Ø¯Ù‚Ø© Ù…Ù† Ø§Ù„ÙÙŠØ¯ÙŠÙˆ.', 'Enter measured panel tilt; video does not establish it precisely.'],
    missing_measured_panel_azimuth: ['Ø£Ø¯Ø®Ù„ Ø§ØªØ¬Ø§Ù‡ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ù…Ù† Ù‚Ø±Ø§Ø¡Ø© Ø¨ÙˆØµÙ„Ø©.', 'Enter the panel direction from a compass reading.'],
    approximate_position_without_atmospheric_refraction: ['Ù…ÙˆØ¶Ø¹ Ø§Ù„Ø´Ù…Ø³ Ø­Ø³Ø§Ø¨ ØªÙ‚Ø±ÙŠØ¨ÙŠ Ù…Ù† Ø§Ù„Ù…ÙˆÙ‚Ø¹ ÙˆØ§Ù„ÙˆÙ‚Øª.', 'Sun position is an approximation from location and time.'],
    reduced_solar_position_accuracy_at_high_latitude: ['Ø¯Ù‚Ø© Ø­Ø³Ø§Ø¨ Ø§Ù„Ø´Ù…Ø³ Ø£Ù‚Ù„ Ø¹Ù†Ø¯ Ø®Ø·ÙˆØ· Ø§Ù„Ø¹Ø±Ø¶ Ø§Ù„Ø¹Ø§Ù„ÙŠØ©.', 'Sun position accuracy is lower at high latitudes.'],
    cell_temperature_model_requires_matching_capture_time_and_nominal_wind_mounting: ['Ø­Ø±Ø§Ø±Ø© Ø§Ù„Ø®Ù„Ø§ÙŠØ§ ØªÙ‚Ø¯ÙŠØ± Ù†Ù…ÙˆØ°Ø¬ÙŠ ÙŠÙØªØ±Ø¶ ØªÙˆØ§ÙÙ‚ ÙˆÙ‚Øª Ø§Ù„Ø·Ù‚Ø³ ÙˆØ§Ù„ØªØµÙˆÙŠØ± ÙˆØ¸Ø±ÙˆÙ ØªØ±ÙƒÙŠØ¨ ÙˆØ±ÙŠØ§Ø­ Ø§Ø³Ù…ÙŠØ©.', 'Cell temperature is modeled and assumes matching weather and capture time, with nominal mounting and wind conditions.'],
    rgb_and_sun_direction_do_not_measure_panel_temperature: ['ØµÙˆØ±Ø© Ø¹Ø§Ø¯ÙŠØ© ÙˆØ§ØªØ¬Ø§Ù‡ Ø§Ù„Ø´Ù…Ø³ Ù„Ø§ ÙŠÙ‚ÙŠØ³Ø§Ù† Ø­Ø±Ø§Ø±Ø© Ø§Ù„Ù„ÙˆØ­. ÙŠÙ„Ø²Ù… Ù…Ø³ØªØ´Ø¹Ø± Ø­Ø±Ø§Ø±Ø© Ø£Ùˆ Ø¨ÙŠØ§Ù†Ø§Øª Ø­Ø±Ø§Ø±ÙŠØ© Ù…Ù†Ø§Ø³Ø¨Ø©.', 'An ordinary image and sun direction do not measure panel temperature. A temperature sensor or suitable thermal data is needed.'],
    missing_confirmed_omr_energy_tariff: ['Ø£Ø¯Ø®Ù„ ØªØ¹Ø±ÙØ© Ø·Ø§Ù‚Ø© Ù…Ø¤ÙƒØ¯Ø© Ø¨Ø§Ù„Ø±ÙŠØ§Ù„ Ø§Ù„Ø¹ÙÙ…Ø§Ù†ÙŠ Ù„Ø¥Ø¸Ù‡Ø§Ø± Ù‚ÙŠÙ…Ø© Ø§Ù„Ø®Ø³Ø§Ø±Ø©.', 'Enter a confirmed OMR energy tariff to show the value of the deficit.'],
    missing_timezone_using_utc_until_weather_resolves_local_timezone: ['Ø§Ù„Ù…Ù†Ø·Ù‚Ø© Ø§Ù„Ø²Ù…Ù†ÙŠØ© ØºÙŠØ± Ù…Ø­Ø¯Ø¯Ø©Ø› Ù‚Ø¯ ØªÙØ³ØªØ®Ø¯Ù… UTC Ø­ØªÙ‰ ÙŠØªÙˆÙØ± Ø·Ù‚Ø³ Ø§Ù„Ù…ÙˆÙ‚Ø¹.', 'The time zone is not set; UTC may be used until location weather is available.'],
    invalid_selected_month: ['Ø­Ø¯Ù‘Ø¯ Ø´Ù‡Ø±Ø§Ù‹ ØµØ­ÙŠØ­Ø§Ù‹.', 'Select a valid month.'],
    selected_month_has_no_completed_days: ['Ù„Ø§ ØªÙˆØ¬Ø¯ Ø£ÙŠØ§Ù… Ù…ÙƒØªÙ…Ù„Ø© ÙÙŠ Ø§Ù„Ø´Ù‡Ø± Ø§Ù„Ù…Ø­Ø¯Ø¯ Ø­ØªÙ‰ Ø§Ù„Ø¢Ù†.', 'The selected month has no completed days yet.'],
    invoice_month_differs_from_selected_month: ['Ø´Ù‡Ø± Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ù…Ø®ØªÙ„Ù Ø¹Ù† Ø´Ù‡Ø± Ø§Ù„ØªØ­Ù„ÙŠÙ„.', 'The bill month differs from the assessment month.'],
    bill_grid_consumption_is_not_solar_production: ['Ø§Ø³ØªÙ‡Ù„Ø§Ùƒ Ø´Ø¨ÙƒØ© Ø§Ù„ÙƒÙ‡Ø±Ø¨Ø§Ø¡ ÙÙŠ Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ù„ÙŠØ³ Ø¥Ù†ØªØ§Ø¬ Ø§Ù„Ø£Ù„ÙˆØ§Ø­.', 'Grid consumption on the bill is not solar generation.'],
    visible_surface_coverage_is_not_energy_loss: ['Ù†Ø³Ø¨Ø© ØªØºØ·ÙŠØ© Ø§Ù„ØºØ¨Ø§Ø± ÙˆØ§Ù„Ø¸Ù„ Ù„Ø§ ØªØ³Ø§ÙˆÙŠ Ù†Ø³Ø¨Ø© ÙÙ‚Ø¯ Ø§Ù„Ø·Ø§Ù‚Ø©.', 'Dust and shade coverage is not the percentage of energy loss.'],
    monthly_model_requires_location: ['Ø£Ø¶Ù Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ù†Ø¸Ø§Ù… Ù„ØªÙ‚Ø¯ÙŠØ± Ø¥Ù†ØªØ§Ø¬ Ø§Ù„Ø´Ù‡Ø± Ù…Ù† Ø§Ù„Ø·Ù‚Ø³.', 'Add the system location to model monthly generation from weather.'],
    monthly_model_requires_measured_tilt_and_azimuth: ['Ø£Ø¯Ø®Ù„ Ø§Ù„Ù…ÙŠÙ„ ÙˆØ§Ù„Ø§ØªØ¬Ø§Ù‡ Ø§Ù„Ù…Ù‚Ø§Ø³ÙŠÙ† Ù„ØªÙ‚Ø¯ÙŠØ± Ø§Ù„Ø¥Ù†ØªØ§Ø¬.', 'Enter measured tilt and facing direction to model generation.'],
    monthly_model_requires_installed_power: ['Ø£Ø¯Ø®Ù„ Ø§Ù„Ù‚Ø¯Ø±Ø© Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠØ© Ù„Ù„Ù†Ø¸Ø§Ù… Ù„ØªÙ‚Ø¯ÙŠØ± Ø§Ù„Ø¥Ù†ØªØ§Ø¬.', 'Enter total system capacity to model generation.'],
    weather_model_is_not_metered_site_generation: ['Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ø§Ù„Ù…ØªÙˆÙ‚Ø¹ Ù…Ø³ØªÙ…Ø¯ Ù…Ù† Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„Ø·Ù‚Ø³ØŒ ÙˆÙ„ÙŠØ³ Ù‚Ø±Ø§Ø¡Ø© Ø¹Ø¯Ù‘Ø§Ø¯ Ø§Ù„Ù…ÙˆÙ‚Ø¹.', 'Expected generation comes from a weather model, not a site meter reading.'],
    incomplete_monthly_weather_no_full_period_estimate: ['Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø·Ù‚Ø³ ØºÙŠØ± Ù…ÙƒØªÙ…Ù„Ø©Ø› Ù„Ù… ÙŠÙØ­Ø³Ø¨ ØªÙ‚Ø¯ÙŠØ± ÙƒØ§Ù…Ù„ Ù„Ù„ÙØªØ±Ø©.', 'Weather data is incomplete; no complete-period estimate was calculated.'],
    monthly_weather_unavailable: ['Ø·Ù‚Ø³ Ø§Ù„Ø´Ù‡Ø± ØºÙŠØ± Ù…ØªØ§Ø­ Ø§Ù„Ø¢Ù†Ø› ÙŠÙ…ÙƒÙ†Ùƒ Ø¥Ø¯Ø®Ø§Ù„ Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ø§Ù„Ù…ØªÙˆÙ‚Ø¹ ÙŠØ¯ÙˆÙŠØ§Ù‹.', 'Monthly weather is unavailable; you can enter expected generation manually.'],
    current_month_includes_completed_days_only_align_inverter_reading_to_end_of_yesterday: ['ÙŠØ´Ù…Ù„ Ø§Ù„Ø´Ù‡Ø± Ø§Ù„Ø­Ø§Ù„ÙŠ Ø§Ù„Ø£ÙŠØ§Ù… Ø§Ù„Ù…ÙƒØªÙ…Ù„Ø© Ø­ØªÙ‰ Ù†Ù‡Ø§ÙŠØ© Ø£Ù…Ø³ ÙÙ‚Ø·Ø› Ø£Ø¯Ø®Ù„ Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ø¹Ø§ÙƒØ³ Ù„Ù„ÙØªØ±Ø© Ù†ÙØ³Ù‡Ø§.', 'The current month includes completed days through yesterday only; enter the inverter reading for that period.'],
    actual_inverter_generation_required_for_monthly_loss: ['Ø£Ø¯Ø®Ù„ Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ø§Ù„ÙØ¹Ù„ÙŠ Ù…Ù† Ø¹Ø¯Ù‘Ø§Ø¯ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø£Ùˆ Ø§Ù„Ø¹Ø§ÙƒØ³ Ù„Ø­Ø³Ø§Ø¨ ÙØ±Ù‚ Ø§Ù„Ø¥Ù†ØªØ§Ø¬.', 'Enter actual PV meter or inverter generation to calculate the generation deficit.'],
    generation_deficit_cannot_be_attributed_to_dust_shade_heat_without_additional_measurements: ['ÙØ±Ù‚ Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ù„Ø§ ÙŠØ­Ø¯Ø¯ ÙˆØ­Ø¯Ù‡ ÙƒÙ… Ø®Ø³Ø±Øª Ø¨Ø³Ø¨Ø¨ Ø§Ù„ØºØ¨Ø§Ø± Ø£Ùˆ Ø§Ù„Ø¸Ù„ Ø£Ùˆ Ø§Ù„Ø­Ø±Ø§Ø±Ø©Ø› ÙŠÙ„Ø²Ù… Ù‚ÙŠØ§Ø³ Ø¥Ø¶Ø§ÙÙŠ.', 'The generation deficit alone cannot separate dust, shade or heat losses; further measurements are needed.'],
    actual_generation_exceeds_reference_no_positive_deficit: ['Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ø§Ù„ÙØ¹Ù„ÙŠ ÙŠØªØ¬Ø§ÙˆØ² Ø§Ù„Ù…Ø±Ø¬Ø¹Ø› Ù„Ø§ ÙŠÙˆØ¬Ø¯ ÙØ±Ù‚ Ø¥Ù†ØªØ§Ø¬ Ù…ÙˆØ¬Ø¨ Ù…Ø­Ø³ÙˆØ¨.', 'Actual generation exceeds the reference; no positive deficit is calculated.'],
    expected_and_actual_pv_generation_refer_to_same_selected_period: ['Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ø§Ù„Ù…ØªÙˆÙ‚Ø¹ ÙˆØ§Ù„ÙØ¹Ù„ÙŠ Ø§Ù„Ù…Ø¯Ø®Ù„Ø§Ù† ÙŠÙØªØ±Ø¶ Ø£Ù†Ù‡Ù…Ø§ ÙŠØºØ·ÙŠØ§Ù† Ø§Ù„ÙØªØ±Ø© Ù†ÙØ³Ù‡Ø§.', 'Entered expected and actual PV generation are assumed to cover the same period.'],
    expected_generation_equals_installed_kw_times_plane_of_array_kwh_per_m2_times_performance_ratio: ['Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ø§Ù„Ù†Ù…ÙˆØ°Ø¬ÙŠ = Ù‚Ø¯Ø±Ø© Ø§Ù„Ù†Ø¸Ø§Ù… Ã— Ø§Ù„Ø¥Ø´Ø¹Ø§Ø¹ Ø¹Ù„Ù‰ Ù…Ø³ØªÙˆÙ‰ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ã— Ù…Ø¹Ø§Ù…Ù„ Ø§Ù„Ø£Ø¯Ø§Ø¡.', 'Modeled generation = system capacity Ã— panel-plane irradiation Ã— performance ratio.'],
    performance_ratio_is_aggregate_and_includes_temperature_inverter_and_other_losses: ['Ù…Ø¹Ø§Ù…Ù„ Ø§Ù„Ø£Ø¯Ø§Ø¡ ÙŠØ´Ù…Ù„ Ø£Ø«Ø± Ø§Ù„Ø­Ø±Ø§Ø±Ø© ÙˆØ§Ù„Ø¹Ø§ÙƒØ³ ÙˆØ®Ø³Ø§Ø¦Ø± Ø£Ø®Ø±Ù‰Ø› Ù„Ø§ ØªÙØ¶Ø§Ù Ù…Ø±Ø© Ø«Ø§Ù†ÙŠØ©.', 'The performance ratio includes temperature, inverter and other losses; they are not added again.'],
    open_meteo_isotropic_sky_and_ground_albedo_0_2: ['ÙŠØ¹ØªÙ…Ø¯ Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„Ø¥Ø´Ø¹Ø§Ø¹ Ø¹Ù„Ù‰ Open-Meteo ÙˆØ§ÙØªØ±Ø§Ø¶ Ø§Ù†Ø¹ÙƒØ§Ø³ Ø£Ø±Ø¶ÙŠ 0.2.', 'The irradiation model uses Open-Meteo and an assumed ground albedo of 0.2.'],
    default_performance_ratio_0_8_not_a_site_calibration: ['Ù…Ø¹Ø§Ù…Ù„ Ø§Ù„Ø£Ø¯Ø§Ø¡ Ø§Ù„Ù…ÙØªØ±Ø¶ 0.8ØŒ ÙˆÙ„Ù… ØªØªÙ… Ù…Ø¹Ø§ÙŠØ±ØªÙ‡ Ù„Ù†Ø¸Ø§Ù…Ùƒ.', 'The assumed performance ratio is 0.8 and is not calibrated for your system.'],
    energy_value_uses_constant_confirmed_omr_tariff_not_bill_total_or_tax: ['Ø§Ù„Ù‚ÙŠÙ…Ø© Ø§Ù„Ù…Ø­Ø³ÙˆØ¨Ø© ØªØ³ØªØ®Ø¯Ù… ØªØ¹Ø±ÙØ© Ø§Ù„Ø·Ø§Ù‚Ø© Ø§Ù„Ù…Ø¤ÙƒØ¯Ø© ÙÙ‚Ø·Ø› Ù„Ø§ ØªØ´Ù…Ù„ Ø§Ù„Ø±Ø³ÙˆÙ… Ø§Ù„Ø«Ø§Ø¨ØªØ© Ø£Ùˆ Ø§Ù„Ø¶Ø±Ø§Ø¦Ø¨.', 'The calculated value uses the confirmed energy tariff only; fixed fees and taxes are excluded.'],
  };
  return notes[key] ? ui(...notes[key]) : typeof key === 'string' ? key : '';
}
function renderAnalysisDetails(snapshot = state) {
  const ai = snapshot.ai; const context = snapshot.solarContext; const monthly = snapshot.monthlyLoss;
  const visual = el('visual-assessment-content');
  const panelButton = el('analyze-panels'); panelButton.disabled = analysisBusy || claudeEnabled !== true || !currentAccount?.id || !mediaFor('panels').length;
  if (ai && snapshot.aiLanguage === state.settings.language) {
    const readings = [
      assessmentMetric(ui('ØªØºØ·ÙŠØ© Ø§Ù„ØºØ¨Ø§Ø± Ø§Ù„Ù…Ø±Ø¦ÙŠØ©', 'Visible dust coverage'), assessmentValue(ai.dustCoveragePercent, '%'), `${ui('Ø§Ù„Ø«Ù‚Ø©', 'Confidence')}: ${confidenceText(ai.dustConfidence)}`),
      assessmentMetric(ui('ØªØºØ·ÙŠØ© Ø§Ù„Ø¸Ù„ Ø§Ù„Ù…Ø±Ø¦ÙŠØ©', 'Visible shade coverage'), assessmentValue(ai.shadeCoveragePercent, '%'), `${ui('Ø§Ù„Ø«Ù‚Ø©', 'Confidence')}: ${confidenceText(ai.shadeConfidence)}`),
    ].join('');
    const observations = [ai.summary, ai.dustEvidence, ai.shadeEvidence, ai.tiltObservation, ai.azimuthObservation].filter((value) => typeof value === 'string' && value);
    const missing = (ai.missingMeasurements || []).filter((value) => typeof value === 'string');
    const frames = (ai.frameFindings || []).filter((value) => value && typeof value.observation === 'string').sort((a, b) => Number(a.frameIndex || 0) - Number(b.frameIndex || 0));
    visual.innerHTML = `<p class="assessment-provider">${escapeHtml(snapshot.aiModel || 'Claude')}</p>${ai.panelDetected === false ? `<p>${ui('Ù„Ù… ÙŠØªØ¹Ø±Ù Claude Ø¹Ù„Ù‰ Ø£Ù„ÙˆØ§Ø­ ÙˆØ§Ø¶Ø­Ø© ÙÙŠ Ø§Ù„Ù…Ø±ÙÙ‚.', 'Claude did not identify clear panels in the attachment.')}</p>` : ''}<div class="assessment-metrics">${readings}</div><ul class="assessment-notes">${observations.map((value) => `<li>${escapeHtml(value)}</li>`).join('')}</ul><p class="helper-text">${ui('Ù‡Ø°Ù‡ ØªØºØ·ÙŠØ© Ù…Ø±Ø¦ÙŠØ© ØªÙ‚Ø¯ÙŠØ±ÙŠØ©ØŒ ÙˆÙ„ÙŠØ³Øª Ù‚ÙŠØ§Ø³Ø§Ù‹ Ù„Ø®Ø³Ø§Ø±Ø© Ø§Ù„Ø·Ø§Ù‚Ø© Ø£Ùˆ Ø­Ø±Ø§Ø±Ø© Ø³Ø·Ø­ Ø§Ù„Ù„ÙˆØ­.', 'This is estimated visible coverage, not a measurement of energy loss or panel surface temperature.')}</p>${missing.length ? `<details><summary>${ui('Ø§Ù„Ù‚ÙŠØ§Ø³Ø§Øª Ø§Ù„Ù†Ø§Ù‚ØµØ©', 'Missing measurements')}</summary><ul class="assessment-notes">${missing.map((value) => `<li>${escapeHtml(value)}</li>`).join('')}</ul></details>` : ''}${frames.length ? `<details><summary>${ui('Ù…Ù„Ø§Ø­Ø¸Ø§Øª Ø§Ù„Ù„Ù‚Ø·Ø§Øª Ø¨Ø§Ù„ØªØ±ØªÙŠØ¨', 'Frame observations in sequence')}</summary><ol class="frame-findings">${frames.map((frame) => `<li>${frame.timestampSeconds !== null && frame.timestampSeconds !== undefined ? `<b>${assessmentValue(frame.timestampSeconds, ui(' Ø«Ø§Ù†ÙŠØ©', ' s'))}</b> Â· ` : ''}${escapeHtml(frame.observation)}</li>`).join('')}</ol></details>` : ''}`;
  } else visual.innerHTML = `${claudeAvailabilityMarkup()}<p class="helper-text">${ai ? ui('Ø§Ù„Ù†ØªÙŠØ¬Ø© Ø§Ù„Ù…Ø­ÙÙˆØ¸Ø© Ø¨Ù„ØºØ© Ø£Ø®Ø±Ù‰Ø› Ø£Ø¹Ø¯ Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ù„Ù‚Ø±Ø§Ø¡ØªÙ‡Ø§ Ø¨Ø§Ù„Ù„ØºØ© Ø§Ù„Ø­Ø§Ù„ÙŠØ©.', 'The saved assessment is in another language; run analysis again for the current language.') : ui('Ø£Ø±ÙÙ‚ ØµÙˆØ±Ø§Ù‹ Ø£Ùˆ ÙÙŠØ¯ÙŠÙˆ Ù„Ù„Ø£Ù„ÙˆØ§Ø­ Ø«Ù… Ø§Ø¶ØºØ· Â«ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… ClaudeÂ». ØªÙØ­Ù„Ù„ Ù„Ù‚Ø·Ø§Øª Ù…ÙˆØ²Ø¹Ø© Ù…Ù† Ø§Ù„ÙÙŠØ¯ÙŠÙˆØŒ ÙˆÙ„ÙŠØ³ Ø§Ù„ØµÙˆØª Ø£Ùˆ ÙƒÙ„ Ø§Ù„Ø¥Ø·Ø§Ø±Ø§Øª.', 'Attach panel photos or a video, then choose â€œPanel assessment with Claudeâ€. Frames sampled across the clip are assessed, not audio or every frame.')}</p>`;
  const solar = el('solar-assessment-content');
  const solarMetrics = context ? [
    assessmentMetric(ui('Ø§ØªØ¬Ø§Ù‡ Ø§Ù„Ø´Ù…Ø³ Ø§Ù„Ù…Ø­Ø³ÙˆØ¨', 'Calculated sun azimuth'), assessmentValue(context.sun?.azimuthDegrees, 'Â°')),
    assessmentMetric(ui('Ø§Ø±ØªÙØ§Ø¹ Ø§Ù„Ø´Ù…Ø³ Ø¹Ù† Ø§Ù„Ø£ÙÙ‚', 'Sun elevation above horizon'), assessmentValue(context.sun?.elevationDegrees, 'Â°'), context.sun?.daylight === false ? ui('Ø§Ù„Ø´Ù…Ø³ ØªØ­Øª Ø§Ù„Ø£ÙÙ‚', 'Sun is below the horizon') : ''),
    assessmentMetric(ui('Ø²Ø§ÙˆÙŠØ© Ø³Ù‚ÙˆØ· Ø§Ù„Ø´Ù…Ø³ Ø¹Ù„Ù‰ Ø§Ù„Ù„ÙˆØ­', 'Sun incidence angle on panel'), assessmentValue(context.panel?.incidenceAngleDegrees, 'Â°'), ui('Ù…Ù† Ø§Ù„Ù…ÙˆÙ‚Ø¹ ÙˆØ§Ù„ÙˆÙ‚Øª ÙˆØ§Ù„Ù…ÙŠÙ„ ÙˆØ§Ù„Ø§ØªØ¬Ø§Ù‡ Ø§Ù„Ù…Ø¯Ø®Ù„', 'From entered location, time, tilt and direction')),
    assessmentMetric(ui('Ø­Ø±Ø§Ø±Ø© Ø§Ù„Ø®Ù„Ø§ÙŠØ§ Ø§Ù„Ù…Ù‚Ø¯Ø±Ø©', 'Estimated cell temperature'), assessmentValue(context.temperature?.estimatedCellTemperatureC, ui('Â°Ù…', 'Â°C')), context.temperature?.source === 'NOCT_model' ? ui('ØªÙ‚Ø¯ÙŠØ± Ù†Ù…ÙˆØ°Ø¬ÙŠØŒ ÙˆÙ„ÙŠØ³ Ù‚ÙŠØ§Ø³Ø§Ù‹ Ø­Ø±Ø§Ø±ÙŠØ§Ù‹', 'Modeled estimate, not a thermal measurement') : ui('Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù‚ÙŠØ§Ø³ Ø­Ø±Ø§Ø±ÙŠ Ù„Ù„Ø³Ø·Ø­', 'No thermal surface measurement')),
  ].join('') : '';
  solar.innerHTML = `<h3>${ui('Ù‡Ù†Ø¯Ø³Ø© Ø§Ù„Ø´Ù…Ø³ ÙˆØ­Ø±Ø§Ø±Ø© Ø§Ù„Ù„ÙˆØ­', 'Sun geometry and panel temperature')}</h3>${context ? `<div class="assessment-metrics">${solarMetrics}</div><ul class="assessment-notes">${(context.limitations || []).map((key) => `<li>${escapeHtml(assessmentNote(key))}</li>`).join('')}</ul>` : `<p class="helper-text">${ui('Ø£Ø¯Ø®Ù„ Ø§Ù„Ù…ÙˆÙ‚Ø¹ ÙˆÙˆÙ‚Øª Ø§Ù„ØªØµÙˆÙŠØ± ÙˆÙ…ÙŠÙ„ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ ÙˆØ§ØªØ¬Ø§Ù‡Ù‡Ø§ Ù„Ø­Ø³Ø§Ø¨ Ø¹Ù„Ø§Ù‚ØªÙ‡Ø§ Ø¨Ø§Ù„Ø´Ù…Ø³. Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ø¹Ø§Ø¯ÙŠØ© Ù„Ø§ ØªÙ‚ÙŠØ³ Ø­Ø±Ø§Ø±Ø© Ø§Ù„Ù„ÙˆØ­.', 'Enter location, capture time, measured panel tilt and facing direction to calculate sun geometry. An ordinary image does not measure panel temperature.')}</p>`}`;
  const host = el('monthly-assessment-content'); const monthInput = el('dashboard-bill-month');
  if (document.activeElement !== monthInput) monthInput.value = monthly?.month || state.form.billMonth || '';
  if (!monthly) {
    host.innerHTML = `<p class="helper-text">${ui('Ø­Ø¯Ù‘Ø¯ Ø§Ù„Ø´Ù‡Ø± Ø«Ù… Ø­Ø¯Ù‘Ø« ØªØ­Ù„ÙŠÙ„Ù‡. Ø£Ø¶Ù Ø¥Ù†ØªØ§Ø¬ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø§Ù„ÙØ¹Ù„ÙŠ Ù…Ù† Ø§Ù„Ø¹Ø§ÙƒØ³ ÙˆØªØ¹Ø±ÙØ© Ø§Ù„ÙƒÙ‡Ø±Ø¨Ø§Ø¡ ÙÙŠ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù… Ù„Ø­Ø³Ø§Ø¨ Ù‚ÙŠÙ…Ø© ÙØ±Ù‚ Ø§Ù„Ø¥Ù†ØªØ§Ø¬.', 'Select a month and update its assessment. Add actual inverter generation and the electricity tariff in system details to calculate the value of the deficit.')}</p>`;
    return;
  }
  const period = monthly.period; const entered = monthly.method === 'provided_expected_generation';
  const heading = monthly.status === 'unavailable' ? ui('Ù„Ø§ ØªÙƒÙÙŠ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ù„Ø­Ø³Ø§Ø¨ Ø®Ø³Ø§Ø±Ø© Ø§Ù„Ø´Ù‡Ø±', 'Insufficient data for monthly losses') : monthly.lostKwh === null || monthly.lostKwh === undefined ? ui('Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ø§Ù„Ù…ØªÙˆÙ‚Ø¹ ÙÙ‚Ø·Ø› Ø§Ù„Ø®Ø³Ø§Ø±Ø© ØºÙŠØ± Ù…Ø­Ø³ÙˆØ¨Ø©', 'Expected generation only; deficit unavailable') : entered ? ui('ÙØ±Ù‚ Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ù…Ù‚Ø§Ø¨Ù„ Ø§Ù„Ø®Ø· Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ Ø§Ù„Ø°ÙŠ Ø£Ø¯Ø®Ù„ØªÙ‡', 'Generation deficit against your entered baseline') : ui('ÙØ±Ù‚ Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ù…Ù‚Ø§Ø¨Ù„ ØªÙ‚Ø¯ÙŠØ± Ø·Ù‚Ø³ Ø§Ù„Ø´Ù‡Ø±', 'Generation deficit against modeled monthly weather');
  const items = [assessmentMetric(ui('Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ø§Ù„Ù…ØªÙˆÙ‚Ø¹', 'Expected generation'), assessmentValue(monthly.expectedKwh, ' kWh', 2)), assessmentMetric(ui('Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ø§Ù„ÙØ¹Ù„ÙŠ Ø§Ù„Ù…Ø¯Ø®Ù„', 'Entered actual generation'), assessmentValue(monthly.actualKwh, ' kWh', 2)), assessmentMetric(ui('ÙØ±Ù‚ Ø§Ù„Ø¥Ù†ØªØ§Ø¬', 'Generation deficit'), assessmentValue(monthly.lostKwh, ' kWh', 2)), assessmentMetric(ui('Ù‚ÙŠÙ…Ø© Ø§Ù„Ø·Ø§Ù‚Ø© Ø§Ù„Ù…ÙÙ‚ÙˆØ¯Ø©', 'Value of generation deficit'), monthly.lossMoney !== null && monthly.lossMoney !== undefined ? `${assessmentValue(monthly.lossMoney, '', 3)} ${ui('Ø±.Ø¹', 'OMR')}` : 'â€”')].join('');
  const notes = [...new Set([...(monthly.warnings || []), ...(monthly.assumptions || [])])];
  host.innerHTML = `<h3>${heading}</h3>${period ? `<p class="assessment-period">${escapeHtml(period.startDate || 'â€”')} â€” ${escapeHtml(period.endDate || 'â€”')} Â· ${escapeHtml(period.daysIncluded ?? 0)} ${ui('ÙŠÙˆÙ…Ø§Ù‹', 'days')}${period.complete ? '' : ` Â· ${ui('Ø­ØªÙ‰ Ù†Ù‡Ø§ÙŠØ© Ø£Ù…Ø³', 'through yesterday')}`}</p>` : ''}<div class="assessment-metrics">${items}</div><p class="helper-text">${ui('Ø§Ù„ÙØ§ØªÙˆØ±Ø© ØªÙØ³ØªØ®Ø¯Ù… Ù„Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ø§Ø³ØªÙ‡Ù„Ø§Ùƒ ÙˆØ§Ù„ØªØ¹Ø±ÙØ©Ø› Ù„Ø§ ØªØ«Ø¨Øª ÙˆØ­Ø¯Ù‡Ø§ Ø®Ø³Ø§Ø±Ø© Ø§Ù„Ø£Ù„ÙˆØ§Ø­. Ù„Ø§ Ù†Ø¶Ø§Ø¹Ù Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„ÙØ§ØªÙˆØ±Ø© ÙÙŠ Ù†Ø³Ø¨Ø© Ø§Ù„ØºØ¨Ø§Ø± Ø£Ùˆ Ø§Ù„Ø¸Ù„.', 'The bill provides consumption and tariff details; it cannot establish panel losses by itself. Bill total is not multiplied by dust or shade coverage.')}</p>${notes.length ? `<details open><summary>${ui('Ù…ØµØ§Ø¯Ø± Ø§Ù„Ø­Ø³Ø§Ø¨ ÙˆØ­Ø¯ÙˆØ¯Ù‡', 'Calculation sources and limitations')}</summary><ul class="assessment-notes">${notes.map((key) => `<li>${escapeHtml(assessmentNote(key))}</li>`).join('')}</ul></details>` : ''}`;
}
function hasLossEstimate(result) {
  return !!result && !(result.heatEstimateUnavailable === true && !(Number(result.soilingPercent) > 0));
}
// Ù†ØªØ§Ø¦Ø¬ Ù…Ø­ÙÙˆØ¸Ø© Ù‚Ø¨Ù„ Ø¥Ø¶Ø§ÙØ© ØªÙØµÙŠÙ„ Ø§Ù„Ø£Ø³Ø¨Ø§Ø¨: Ù†ÙƒÙ…Ù„ Ø­Ù‚ÙˆÙ„ Ø§Ù„ØºØ¨Ø§Ø± ÙˆØ§Ù„Ø¸Ù„ ÙˆØ§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ù…Ù† Ø§Ù„Ù…Ø¯Ø®Ù„Ø§Øª
// Ø§Ù„Ø­Ø§Ù„ÙŠØ© Ù…Ø±Ø© ÙˆØ§Ø­Ø¯Ø©ØŒ Ø«Ù… ØªØµØ¨Ø­ Ø§Ù„ÙˆØ§Ø¬Ù‡Ø© ÙˆØ§Ù„ØªÙ‚Ø±ÙŠØ± Ù…ØªØ³Ù‚ÙŠÙ†.
function ensureLossBreakdown(result) {
  if (!result || result.dustPercent !== undefined) return result;
  const fresh = calculateLoss();
  result.dustPercent = fresh.dustPercent ?? null;
  result.shadePercent = fresh.shadePercent ?? 0;
  const heat = Number(result.heatPercent) || 0;
  result.totalPercent = Math.min(100, Math.round(heat + (result.dustPercent || 0) + (result.shadePercent || 0)));
  result.percent = result.totalPercent;
  result.lostKwh = (Number(result.possibleKwh) || 0) * (result.totalPercent / 100);
  result.lostMoney = result.lostKwh * (Number(result.tariffOmrPerKwh) || 0);
  result.soilingPercent = result.dustPercent;
  return result;
}
function renderLossBreakdown(result) {
  const box = el('loss-breakdown');
  if (!box) return;
  ensureLossBreakdown(result);
  if (!result) { box.hidden = true; return; }
  const heat = result.heatPercent === null || result.heatPercent === undefined ? null : Number(result.heatPercent);
  const dust = result.dustPercent === null || result.dustPercent === undefined
    ? (result.soilingPercent === null || result.soilingPercent === undefined ? null : Number(result.soilingPercent))
    : Number(result.dustPercent);
  const shade = Number.isFinite(Number(result.shadePercent)) ? Number(result.shadePercent) : 0;
  const total = Number.isFinite(Number(result.totalPercent)) ? Number(result.totalPercent) : Math.min(100, Math.round((heat || 0) + (dust || 0) + shade));
  const hasAny = heat !== null || dust !== null || shade > 0;
  if (!hasAny) { box.hidden = true; return; }
  box.hidden = false;
  const row = (variant, label, value) => `<div class="loss-row ${variant}"><span><i></i>${escapeHtml(label)}</span><b>${value === null ? 'â€”' : `${Math.round(value)}%`}</b></div>`;
  el('loss-components').innerHTML = [
    row('heat', ui('Ø§Ù„Ø­Ø±Ø§Ø±Ø©', 'Heat'), heat),
    row('dust', ui('Ø§Ù„ØºØ¨Ø§Ø±', 'Dust'), dust),
    row('shade', ui('Ø§Ù„Ø¸Ù„', 'Shade'), shade),
    `<div class="loss-row loss-total"><span>${ui('Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„ØªÙ‚Ø¯ÙŠØ±', 'Estimated total')}</span><b>${total}%</b></div>`,
  ].join('');
  const instant = el('loss-instant');
  if (instant) instant.innerHTML = `<h4>${ui('Ø§Ù„ÙÙ‚Ø¯ Ø§Ù„Ù„Ø­Ø¸ÙŠ', 'Instantaneous loss')}</h4><b>${heat === null ? 'â€”' : `${Math.round(heat)}%`}</b><p>${ui('Ø¨Ø³Ø¨Ø¨ Ø­Ø±Ø§Ø±Ø© Ø§Ù„Ø£Ù„ÙˆØ§Ø­ ÙˆÙ‚Øª Ø§Ù„ÙØ­ØµØŒ Ù…Ù† Ø­Ø±Ø§Ø±Ø© Ø§Ù„Ø¬Ùˆ ÙˆØ§Ù„Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„Ø­Ø±Ø§Ø±ÙŠ.', 'From panel heat at inspection time, based on air temperature and the heat model.')}</p>`;
  const monthly = result.monthlyLoss || state.monthlyLoss;
  const monthlyNode = el('loss-monthly');
  if (monthlyNode) {
    if (monthly && monthly.lostKwh !== null && monthly.lostKwh !== undefined) {
      const value = `${Number(monthly.lostKwh).toFixed(2)}<span class="unit"> kWh</span>`;
      const value2 = monthly.lossMoney !== null && monthly.lossMoney !== undefined ? ` Â· ${money(monthly.lossMoney)}` : '';
      monthlyNode.innerHTML = `<h4>${ui('Ø§Ù„Ø®Ø³Ø§Ø±Ø© Ø§Ù„Ø´Ù‡Ø±ÙŠØ©', 'Monthly loss')}</h4><b>${value}</b><p>${ui('Ø§Ù„ÙØ±Ù‚ Ø¨ÙŠÙ† Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ø§Ù„Ù…ØªÙˆÙ‚Ø¹ ÙˆØ§Ù„Ø¥Ù†ØªØ§Ø¬ Ø§Ù„ÙØ¹Ù„ÙŠ', 'Expected minus actual generation')}${value2}.</p>`;
    } else {
      monthlyNode.innerHTML = `<h4>${ui('Ø§Ù„Ø®Ø³Ø§Ø±Ø© Ø§Ù„Ø´Ù‡Ø±ÙŠØ©', 'Monthly loss')}</h4><b>â€”</b><p>${ui('Ø£Ø¶Ù Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ø§Ù„Ù…ØªÙˆÙ‚Ø¹ ÙˆØ§Ù„ÙØ¹Ù„ÙŠ Ù„Ø­Ø³Ø§Ø¨ Ø®Ø³Ø§Ø±Ø© Ø§Ù„Ø´Ù‡Ø±.', 'Add expected and actual generation to calculate the monthly loss.')}</p>`;
    }
  }
  const note = el('loss-breakdown-note');
  if (note) note.textContent = ui('Ø§Ù„Ù†Ø³Ø¨ Ø£Ø¹Ù„Ø§Ù‡ ØªÙ‚Ø¯ÙŠØ±ÙŠØ©: Ø§Ù„Ø­Ø±Ø§Ø±Ø© Ù…Ù† Ø§Ù„Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„Ø­Ø±Ø§Ø±ÙŠØŒ ÙˆØ§Ù„ØºØ¨Ø§Ø± ÙˆØ§Ù„Ø¸Ù„ Ù…Ù† Ø§Ù„ØªØºØ·ÙŠØ© Ø§Ù„Ù…Ø±Ø¦ÙŠØ© Ø£Ùˆ Ø§Ù„Ù…Ø¤Ø´Ø± Ø§Ù„Ø¬ÙˆÙŠØŒ ÙˆÙ„ÙŠØ³Øª Ù‚ÙŠØ§Ø³Ø§Ù‹ ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠØ§Ù‹ Ù…Ø¨Ø§Ø´Ø±Ø§Ù‹.', 'The percentages above are estimates: heat from the heat model, dust and shade from visible coverage or the air index, not direct electrical measurements.');
}
function renderDashboard(note = '') {
  const f = state.form; const result = state.result || (f.power ? calculateLoss() : null); const current = state.weather?.current;
  ensureLossBreakdown(result);
  renderLossBreakdown(result);
  renderAnalysisDetails();
  renderMaintenance();
  renderPanelVisual();
  el('user-name').textContent = f.name ? escapeHtml(f.name) : 'ÙŠØ§ ØµØ¯ÙŠÙ‚ Ø§Ù„Ø´Ù…Ø³';
  const locale = state.settings.language === 'en' ? 'en-OM' : 'ar-OM';
  el('today-date').textContent = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  el('footer-year').textContent = new Date().getFullYear(); syncHeader();
  if (current) {
    el('metric-temp').textContent = `${Math.round(current.temperature_2m)}Â°`;
    el('metric-humidity').textContent = `${Math.round(current.relative_humidity_2m)}%`;
    el('gauge-temp').textContent = `${Math.round(current.temperature_2m)}Â°Ù…`;
    el('weather-summary').textContent = `${weatherText(current.weather_code)} Â· ${Math.round(current.temperature_2m)}Â°Ù…`;
    el('weather-icon').textContent = current.is_day ? 'â˜€' : 'â˜¾';
  } else {
    el('metric-temp').textContent = f.ambientTemp ? `${f.ambientTemp}Â°` : 'â€”Â°'; el('metric-humidity').textContent = f.humidity ? `${f.humidity}%` : 'â€”%';
    el('gauge-temp').textContent = f.ambientTemp ? `${Math.round(f.ambientTemp)}Â°Ù…` : 'â€”Â°'; el('weather-summary').textContent = 'Ø§Ù„Ø·Ù‚Ø³ ØºÙŠØ± Ù…ØªØ§Ø­';
  }
  const airDust = f.airDustPercent !== null && f.airDustPercent !== '' && f.airDustPercent !== undefined ? Number(f.airDustPercent) : NaN;
  const dustReading = airborneDustReading(state.weather);
  el('metric-dust').textContent = Number.isFinite(airDust) ? `${Math.round(airDust)}%` : 'â€”%';
  el('dust-caption').textContent = f.airDustManual ? ui('Ù…Ø¤Ø´Ø± Ø¬ÙˆÙŠ Ù…Ø¹Ø¯Ù‘Ù„ ÙŠØ¯ÙˆÙŠØ§Ù‹', 'Manually adjusted air index') : dustReading ? `${dustReading.source === 'pm10' ? 'PM10' : ui('ØºØ¨Ø§Ø± Ø¬ÙˆÙŠ', 'Airborne dust')} ${dustReading.concentration.toFixed(1)} Âµg/mÂ³ Â· ${ui('Ù…Ø¤Ø´Ø± Ù†Ø³Ø¨ÙŠ', 'Relative index')}` : ui('Ø§Ù„ØºØ¨Ø§Ø± ÙÙŠ Ø§Ù„Ø¬Ùˆ ØºÙŠØ± Ù…ØªØ§Ø­', 'Airborne dust unavailable');
  if (hasLossEstimate(result)) {
    el('loss-percent').textContent = `${result.percent}%`;
    const valuePath = el('gauge-value'); const pathLength = 302; valuePath.style.strokeDashoffset = String(pathLength - pathLength * Math.min(100, result.percent) / 100);
    valuePath.style.stroke = result.percent > 30 ? 'var(--orange)' : result.percent > 15 ? '#e9824b' : '#a79370';
    el('metric-loss').textContent = `${result.lostKwh.toFixed(2)} kWh`;
    el('loss-caption').textContent = `${money(result.lostMoney)} ØªÙ‚Ø±ÙŠØ¨Ø§Ù‹ Â· ${result.priceBasis}`;
    el('status-title').textContent = result.percent >= 30 ? 'ÙŠØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ Ø§Ù†ØªØ¨Ø§Ù‡' : result.percent >= 15 ? 'Ù…Ø³ØªÙˆÙ‰ Ù…ØªÙˆØ³Ø·' : 'Ø£Ø¯Ø§Ø¡ Ù…Ø·Ù…Ø¦Ù†';
    el('status-pill').innerHTML = `<i></i> ${result.percent >= 30 ? 'Ø§Ù†ØªØ¨Ø§Ù‡' : result.percent >= 15 ? 'Ù…Ø±Ø§Ù‚Ø¨Ø©' : 'Ø¬ÙŠØ¯'}`;
    el('status-pill').className = `status-pill ${result.percent < 15 ? 'good' : ''}`;
    el('status-summary').textContent = state.ai ? ui('ÙØ­Øµ Ø¨ØµØ±ÙŠ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Claude', 'Visual assessment with Claude') : 'ØªÙ‚Ø¯ÙŠØ± Ø£ÙˆÙ„ÙŠ Ù„Ø£Ø¯Ø§Ø¡ Ø§Ù„Ù†Ø¸Ø§Ù…';
    const heatShare = result.heatPercent === null || result.heatPercent === undefined ? null : Math.round(result.heatPercent);
    const dustShare = result.dustPercent === null || result.dustPercent === undefined ? null : Math.round(result.dustPercent);
    const shadeShare = Number.isFinite(Number(result.shadePercent)) ? Math.round(Number(result.shadePercent)) : 0;
    const estimateDescription = heatShare === null && dustShare === null
      ? ui('ÙŠÙˆÙ…ÙŠØ§Ù‹Ø› Ù„Ø§ ØªØªÙˆÙØ± Ù†Ø³Ø¨ Ù…ÙØµÙ„Ø© Ù„Ù‡Ø°Ù‡ Ø§Ù„Ù‚Ø±Ø§Ø¡Ø©.', 'per day; no detailed percentages are available for this reading.')
      : ui(`ÙŠÙˆÙ…ÙŠØ§Ù‹: Ø§Ù„Ø­Ø±Ø§Ø±Ø© ${heatShare ?? 'â€”'}% Â· Ø§Ù„ØºØ¨Ø§Ø± ${dustShare ?? 'â€”'}% Â· Ø§Ù„Ø¸Ù„ ${shadeShare}% (Ø¥Ø¬Ù…Ø§Ù„ÙŠ ${result.totalPercent ?? result.percent}%).`, `per day: heat ${heatShare ?? 'â€”'}% Â· dust ${dustShare ?? 'â€”'}% Â· shade ${shadeShare}% (total ${result.totalPercent ?? result.percent}%).`);
    el('status-description').textContent = (note ? `${note} Ø§Ù„Ù†ØªÙŠØ¬Ø© Ø§Ù„Ø­Ø§Ù„ÙŠØ© ØªÙ‚Ø¯ÙŠØ±ÙŠØ© ÙˆØªØ¹ØªÙ…Ø¯ Ø¹Ù„Ù‰ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ØªÙŠ Ø£Ø¯Ø®Ù„ØªÙ‡Ø§.` : `Ù‚Ø¯ ÙŠÙÙ‚Ø¯ Ø§Ù„Ù†Ø¸Ø§Ù… Ù†Ø­Ùˆ ${result.lostKwh.toFixed(2)} kWh ${estimateDescription}`)
      + (result.heatEstimateUnavailable ? ui(' Ù„Ø§ ØªØªÙˆÙØ± Ø¨ÙŠØ§Ù†Ø§Øª ÙƒØ§ÙÙŠØ© Ù„ØªÙ‚Ø¯ÙŠØ± Ø®Ø³Ø§Ø±Ø© Ø§Ù„Ø·Ø§Ù‚Ø©.', ' There is not enough data to estimate energy losses.') : '');
    el('recommendation-title').textContent = dustShare >= 15 ? 'Ù‚Ø¯ ÙŠÙƒÙˆÙ† ØªÙ†Ø¸ÙŠÙ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ù…ÙÙŠØ¯Ø§Ù‹' : heatShare > 10 ? 'Ø±Ø§Ù‚Ø¨ Ø£Ø«Ø± Ø§Ù„Ø­Ø±Ø§Ø±Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù„ÙˆØ§Ø­' : 'Ø­Ø§ÙØ¸ Ø¹Ù„Ù‰ Ù…ØªØ§Ø¨Ø¹Ø© Ø¯ÙˆØ±ÙŠØ©';
    const aiRecommendation = state.aiLanguage === state.settings.language ? state.ai?.recommendations?.[0] : '';
    el('recommendation-text').textContent = aiRecommendation || (dustShare >= 15 ? 'ÙŠØ¸Ù‡Ø± ØªÙ‚Ø¯ÙŠØ± Ø§Ù„ØºØ¨Ø§Ø± Ù…Ø±ØªÙØ¹Ø§Ù‹Ø› ØªØ­Ù‚Ù‚ Ø¨ØµØ±ÙŠØ§Ù‹ Ù…Ù† Ø§Ù„Ø£Ù„ÙˆØ§Ø­ ÙˆÙ†Ø¸Ù‘ÙÙ‡Ø§ Ø¹Ù†Ø¯ Ø§Ù„Ø­Ø§Ø¬Ø© ÙˆØ¨Ø·Ø±ÙŠÙ‚Ø© Ø¢Ù…Ù†Ø©.' : heatShare > 10 ? 'Ø­Ø±Ø§Ø±Ø© Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ù‚Ø¯ ØªØ®ÙØ¶ Ø§Ù„Ø¥Ù†ØªØ§Ø¬ ÙˆÙ‚Øª Ø§Ù„Ø°Ø±ÙˆØ©Ø› Ø±Ø§Ù‚Ø¨ Ø§Ù„ØªÙ‡ÙˆÙŠØ© ÙˆØªØ¬Ù†Ù‘Ø¨ Ø§Ù„Ø¹Ù…Ù„ Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø·Ø­ ÙˆÙ‚Øª Ø§Ù„Ø¸Ù‡ÙŠØ±Ø©.' : 'ØªØ§Ø¨Ø¹ Ø§Ù„ØªØºÙŠØ±Ø§Øª ÙÙŠ Ø§Ù„Ø·Ù‚Ø³ ÙˆØ§ÙØ­Øµ Ø³Ø·Ø­ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø¨Ø¹Ø¯ Ø§Ù„Ø¹ÙˆØ§ØµÙ Ø£Ùˆ ÙØªØ±Ø§Øª Ø§Ù„ØºØ¨Ø§Ø±.');
  } else {
    el('loss-percent').textContent = 'â€”%'; el('metric-loss').textContent = 'â€”'; el('loss-caption').textContent = 'Ø£Ø¶Ù Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù… Ø£ÙˆÙ„Ø§Ù‹';
    el('status-title').textContent = 'Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø¨ÙŠØ§Ù†Ø§Øª Ù†Ø¸Ø§Ù…Ùƒ'; el('status-pill').innerHTML = '<i></i> Ø§Ø¨Ø¯Ø£ Ø§Ù„ØªØ­Ù„ÙŠÙ„'; el('status-pill').className = 'status-pill';
    el('status-summary').textContent = 'Ù†Ø­ØªØ§Ø¬ Ø¨Ø¹Ø¶ Ø§Ù„ØªÙØ§ØµÙŠÙ„ Ø£ÙˆÙ„Ø§Ù‹'; el('status-description').textContent = 'Ø£Ø¯Ø®Ù„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù… ÙˆØ£Ø±ÙÙ‚ ØµÙˆØ±Ø© Ø£Ùˆ Ù…Ù‚Ø·Ø¹Ø§Ù‹ Ù„Ù„Ø£Ù„ÙˆØ§Ø­ Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ù‚Ø±Ø§Ø¡Ø© Ø£ÙˆØ¶Ø­.';
  }
  const alert = el('weather-alert');
  if (current) {
    const temp = Number(current.temperature_2m); const gust = Number(current.wind_gusts_10m); const rain = Number(state.weather?.daily?.precipitation_probability_max?.[0]);
    let alertMessage = '';
    if (temp >= 43) alertMessage = `Ø­Ø±Ø§Ø±Ø© Ù…Ø±ØªÙØ¹Ø© (${Math.round(temp)}Â°Ù…) ÙÙŠ Ù…ÙˆÙ‚Ø¹ÙƒØ› ØªØ¬Ù†Ø¨ Ù„Ù…Ø³ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ ÙˆÙ‚Øª Ø§Ù„Ø¸Ù‡ÙŠØ±Ø©.`;
    else if (gust >= 55) alertMessage = `Ù‡Ø¨Ø§Øª Ø±ÙŠØ§Ø­ Ù‚ÙˆÙŠØ© ØªØµÙ„ Ø¥Ù„Ù‰ ${Math.round(gust)} ÙƒÙ…/Ø³Ø› Ø£Ø¬Ù‘Ù„ Ø§Ù„ØµØ¹ÙˆØ¯ Ø¥Ù„Ù‰ Ø§Ù„Ø³Ø·Ø­ Ø­ØªÙ‰ ØªÙ‡Ø¯Ø£.`;
    else if (rain >= 75) alertMessage = `Ø§Ø­ØªÙ…Ø§Ù„ Ù‡Ø·ÙˆÙ„ Ù…Ø±ØªÙØ¹ (${rain}%)Ø› Ø±Ø§Ù‚Ø¨ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø¨Ø¹Ø¯ Ø§Ù†Ù‚Ø¶Ø§Ø¡ Ø§Ù„Ø·Ù‚Ø³.`;
    alert.textContent = alertMessage; alert.hidden = !alertMessage;
  } else alert.hidden = true;
  el('last-updated').textContent = state.updatedAt ? new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(state.updatedAt)) : 'â€”';
  const systemItems = [['Ø§Ù„Ù‚Ø¯Ø±Ø©', f.power ? `${f.power} ÙˆØ§Ø·` : 'â€”'], ['Ø§Ù„Ø£Ù„ÙˆØ§Ø­', f.panels ? `${f.panels} Ù„ÙˆØ­` : 'â€”'], ['Ø§Ù„Ø´Ø±ÙƒØ©', f.company || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯Ø©'], ['Ø§Ù„Ù…ÙˆÙ‚Ø¹', f.location || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'], ['Ø§Ù„Ù…ÙŠÙ„', f.tilt ? `${f.tilt}Â°` : 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'], ['Ø¢Ø®Ø± ØµÙŠØ§Ù†Ø©', f.lastMaintenanceAt ? maintenanceDateLabel(parseIsoDate(f.lastMaintenanceAt), locale) : ui('Ù„Ù… ØªÙØ³Ø¬Ù„', 'Not recorded')]];
  el('system-summary').innerHTML = systemItems.map(([label, value]) => `<div class="system-item"><small>${label}</small><b>${escapeHtml(value)}</b></div>`).join('');
  renderWeatherStatus();
  drawChart(result); applyLanguage();
}
function weatherConditionLabel(code, english) {
  const value = Number(code);
  const table = [
    [[0], 'ØµØ§ÙÙ', 'Clear'],
    [[1], 'ØµØ§ÙÙ ØºØ§Ù„Ø¨Ù‹Ø§', 'Mainly clear'],
    [[2], 'ØºØ§Ø¦Ù… Ø¬Ø²Ø¦ÙŠÙ‹Ø§', 'Partly cloudy'],
    [[3], 'ØºØ§Ø¦Ù…', 'Overcast'],
    [[45, 48], 'Ø¶Ø¨Ø§Ø¨', 'Fog'],
    [[51, 53, 55, 56, 57], 'Ø±Ø°Ø§Ø°', 'Drizzle'],
    [[61, 63, 65, 66, 67], 'Ù…Ø·Ø±', 'Rain'],
    [[71, 73, 75, 77], 'Ø«Ù„Ø¬', 'Snow'],
    [[80, 81, 82], 'Ø²Ø®Ø§Øª Ù…Ø·Ø±', 'Rain showers'],
    [[85, 86], 'Ø²Ø®Ø§Øª Ø«Ù„Ø¬', 'Snow showers'],
    [[95, 96, 99], 'Ø¹ÙˆØ§ØµÙ Ø±Ø¹Ø¯ÙŠØ©', 'Thunderstorm'],
  ];
  for (const [codes, arabic, englishWord] of table) if (codes.includes(value)) return english ? englishWord : arabic;
  return english ? 'Variable' : 'Ù…ØªØºÙŠÙ‘Ø±';
}
function weeklyProductionSeries() {
  const daily = state.weather?.daily || {};
  const codes = Array.isArray(daily.weather_code) ? daily.weather_code : [];
  const rain = Array.isArray(daily.precipitation_probability_max) ? daily.precipitation_probability_max : [];
  const highs = Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max : [];
  return Array.from({ length: 7 }, (_, index) => {
    const code = Number(codes[index]);
    const wet = Number(rain[index]);
    const high = Number(highs[index]);
    let penalty;
    if (!Number.isFinite(code)) penalty = 12;
    else if (code === 0) penalty = 0;
    else if (code <= 2) penalty = 8;
    else if (code === 3) penalty = 26;
    else if (code <= 48) penalty = 34;
    else if (code <= 57) penalty = 40;
    else if (code <= 67) penalty = 58;
    else if (code <= 77) penalty = 66;
    else if (code <= 82) penalty = 54;
    else penalty = 72;
    if (Number.isFinite(wet) && wet > 0) penalty += Math.min(24, wet * 0.35);
    if (Number.isFinite(high) && high > 35) penalty += Math.min(16, (high - 35) * 1.6);
    return Math.max(12, Math.min(100, Math.round(100 - penalty)));
  });
}
function weeklyProductionDays(english) {
  const weekdays = english
    ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    : ['Ø§Ù„Ø£Ø­Ø¯', 'Ø§Ù„Ø¥Ø«Ù†ÙŠÙ†', 'Ø§Ù„Ø«Ù„Ø§Ø«Ø§Ø¡', 'Ø§Ù„Ø£Ø±Ø¨Ø¹Ø§Ø¡', 'Ø§Ù„Ø®Ù…ÙŠØ³', 'Ø§Ù„Ø¬Ù…Ø¹Ø©', 'Ø§Ù„Ø³Ø¨Øª'];
  const dateFormat = new Intl.DateTimeFormat(english ? 'en-OM' : 'ar-OM', { day: 'numeric', month: 'short' });
  const now = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + index);
    return { today: index === 0, name: weekdays[date.getDay()], date: dateFormat.format(date) };
  });
}
function drawChart(result) {
  const english = state.settings.language === 'en';
  const days = weeklyProductionDays(english);
  const values = weeklyProductionSeries();
  const chart = el('weekly-chart');
  if (chart) {
    const codes = state.weather?.daily?.weather_code || [];
    chart.innerHTML = values.map((value, index) => {
      const day = days[index];
      const label = day.today ? (english ? 'Today' : 'Ø§Ù„ÙŠÙˆÙ…') : day.name;
      const condition = weatherConditionLabel(codes[index], english);
      const caption = `${label} Â· ${day.date} Â· ${condition} Â· ${english ? 'expected output' : 'Ø¥Ù†ØªØ§Ø¬ Ù…ØªÙˆÙ‚Ø¹'} ${value}%`;
      return `<div class="chart-day${day.today ? ' is-today' : ''}" title="${escapeHtml(caption)}" aria-label="${escapeHtml(caption)}"><div class="chart-plot"><div class="chart-bar" style="height:${value}%"><span class="chart-value">${value}%</span></div></div><span class="chart-label">${escapeHtml(label)}</span></div>`;
    }).join('');
  }
  const caption = el('chart-caption');
  if (caption) caption.textContent = hasLossEstimate(result) ? `ÙÙ‚Ø¯ Ø§Ù„ÙŠÙˆÙ… ${result.percent}% Â· Ø¥Ø´Ø¹Ø§Ø¹ Ø§Ù„Ø´Ù…Ø³ ÙŠØªØºÙŠØ± Ø­Ø³Ø¨ Ø§Ù„Ø·Ù‚Ø³` : 'ØªÙ‚Ø¯ÙŠØ±Ø§Øª Ø£ÙˆÙ„ÙŠØ© ØªØªØ­Ø¯Ø« Ù…Ø¹ Ø§Ù„Ø·Ù‚Ø³';
}
function renderHistory() {
  const host = el('history-list');
  const locale = state.settings.language === 'en' ? 'en-OM' : 'ar-OM';
  if (!state.history.length) { host.innerHTML = '<div class="history-empty"><div class="empty-icon">â˜¼</div><h3>Ù„Ø§ ØªÙˆØ¬Ø¯ ÙØ­ÙˆØµØ§Øª Ù…Ø­ÙÙˆØ¸Ø© Ø¨Ø¹Ø¯</h3><p>Ø¨Ø¹Ø¯ Ø¥Ø¹Ø¯Ø§Ø¯ Ù†Ø¸Ø§Ù…Ùƒ Ø³ÙŠØ¸Ù‡Ø± Ù‡Ù†Ø§ Ø³Ø¬Ù„ Ø§Ù„ÙØ­ÙˆØµØ§Øª.</p><button class="button button-primary" id="history-empty-new">Ø¥Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ù†Ø¸Ø§Ù…</button></div>'; el('history-empty-new')?.addEventListener('click', () => openWizard(0)); applyLanguage(); return; }
  host.innerHTML = state.history.map((item) => `<div class="history-row"><div class="history-date"><b>${new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(item.createdAt))}</b><small>${new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(item.createdAt))} Â· ${escapeHtml(item.location)}</small></div><div class="history-cell">Ø§Ù„ÙÙ‚Ø¯ Ø§Ù„ØªÙ‚Ø¯ÙŠØ±ÙŠ <b>${hasLossEstimate(item) ? `${item.percent}%` : 'â€”'}</b></div><div class="history-cell">${hasLossEstimate(item) ? `${Number(item.lostKwh).toFixed(2)} kWh` : 'â€”'}</div><div><span class="history-badge">${item.ai ? 'ÙØ­Øµ Ø¨ØµØ±ÙŠ' : 'ØªÙ‚Ø¯ÙŠØ± Ø£ÙˆÙ„ÙŠ'}</span></div><button data-history-open="${item.id}">Ø¹Ø±Ø¶</button></div>`).join('');
  host.querySelectorAll('[data-history-open]').forEach((button) => button.addEventListener('click', () => {
    const item = state.history.find((row) => row.id === button.dataset.historyOpen); if (!item) return;
    showPage('dashboard'); el('loss-percent').textContent = hasLossEstimate(item) ? `${item.percent}%` : 'â€”%'; el('metric-loss').textContent = hasLossEstimate(item) ? `${Number(item.lostKwh).toFixed(2)} kWh` : 'â€”';
    el('status-title').textContent = 'ÙØ­Øµ Ù…Ø­ÙÙˆØ¸'; el('status-description').textContent = hasLossEstimate(item) ? `ÙÙ‚Ø¯ Ø§Ù„Ø·Ø§Ù‚Ø© Ø§Ù„ØªÙ‚Ø¯ÙŠØ±ÙŠ Ø­ÙŠÙ†Ù‡Ø§: ${money(item.lostMoney)}.` : ui('Ù„Ù… ØªØªÙˆÙØ± Ø¨ÙŠØ§Ù†Ø§Øª ÙƒØ§ÙÙŠØ© Ù„ØªÙ‚Ø¯ÙŠØ± Ø®Ø³Ø§Ø±Ø© Ø§Ù„Ø·Ø§Ù‚Ø© ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„ÙØ­Øµ.', 'This inspection had insufficient data to estimate energy losses.');
    renderLossBreakdown(item);
    renderAnalysisDetails({ ai: item.visualAssessment || null, aiLanguage: item.aiLanguage, aiModel: item.aiModel, solarContext: item.solarContext, monthlyLoss: item.monthlyLoss });
    applyLanguage();
  }));
  applyLanguage();
}
function renderSettings() {
  el('setting-notifications').checked = devicePushEnabled;
  el('setting-notifications').disabled = devicePushBusy || !currentAccount;
  el('setting-dark').checked = !!state.settings.dark; el('setting-sound').checked = !!state.settings.sound; el('setting-language').value = state.settings.language || 'ar';
  const cooldown = Number(appSettings?.dust_alert_cooldown_days);
  const deviceStatus = devicePushStateKnown ? (devicePushEnabled ? 'Ù…ÙØ¹Ù‘Ù„Ø© Ø¹Ù„Ù‰ Ù‡Ø°Ø§ Ø§Ù„Ø¬Ù‡Ø§Ø²' : 'ØºÙŠØ± Ù…ÙØ¹Ù‘Ù„Ø© Ø¹Ù„Ù‰ Ù‡Ø°Ø§ Ø§Ù„Ø¬Ù‡Ø§Ø²') : 'ØªØ¹Ø°Ø± Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ù‡Ø°Ø§ Ø§Ù„Ø¬Ù‡Ø§Ø².';
  el('notification-hint').textContent = `ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ù‡Ø°Ø§ Ø§Ù„Ø¬Ù‡Ø§Ø² ÙÙ‚Ø· Â· ${deviceStatus}${Number.isFinite(cooldown) ? ` Â· ÙƒÙ„ ${cooldown} ÙŠÙˆÙ…Ø§Ù‹ ÙƒØ­Ø¯ Ø£Ù‚ØµÙ‰` : ''}`;
  applyLanguage();
}
// ---------- Ø§Ù„Ø¨Ù„Ø§ØºØ§Øª ÙˆØ§Ù„Ø´ÙƒØ§ÙˆÙ‰ ----------
const COMPLAINT_CATEGORIES = {
  performance: ['Ø¶Ø¹Ù ÙÙŠ Ø§Ù„Ø¥Ù†ØªØ§Ø¬', 'Low generation'],
  dust: ['ØºØ¨Ø§Ø± Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù„ÙˆØ§Ø­', 'Dust on panels'],
  heat: ['Ø­Ø±Ø§Ø±Ø© Ù…Ø±ØªÙØ¹Ø©', 'High heat'],
  shade: ['ØªØ¸Ù„ÙŠÙ„ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù„ÙˆØ§Ø­', 'Panel shading'],
  electrical: ['Ù…Ø´ÙƒÙ„Ø© ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠØ©', 'Electrical problem'],
  service: ['Ø·Ù„Ø¨ ØµÙŠØ§Ù†Ø©', 'Maintenance request'],
  other: ['Ø£Ø®Ø±Ù‰', 'Other'],
};
function complaintCategoryLabel(value) {
  const entry = COMPLAINT_CATEGORIES[value] || COMPLAINT_CATEGORIES.other;
  return ui(entry[0], entry[1]);
}
function renderReports() {
  const note = el('complaint-email-note');
  if (note) {
    note.textContent = complaintConfig.delivery
      ? ui(`Ø³ÙŠÙØ±Ø³Ù„ Ø§Ù„Ø¨Ù„Ø§Øº Ù…Ø¨Ø§Ø´Ø±Ø© Ø¥Ù„Ù‰ ÙØ±ÙŠÙ‚ Ø§Ù„ØµÙŠØ§Ù†Ø© Ø¹Ù„Ù‰ ${complaintConfig.email}.`, `Your complaint is sent directly to the maintenance team at ${complaintConfig.email}.`)
      : ui(`Ø³ÙŠÙØ¬Ù‡ÙŽÙ‘Ø² Ø§Ù„Ø¨Ù„Ø§Øº ÙˆÙŠÙØªØ­ Ø¨Ø±ÙŠØ¯Ùƒ Ù„Ø¥Ø±Ø³Ø§Ù„Ù‡ Ø¥Ù„Ù‰ ${complaintConfig.email}ØŒ Ø£Ùˆ ÙŠÙ…ÙƒÙ†Ùƒ Ù†Ø³Ø®Ù‡ ÙˆÙ…Ø´Ø§Ø±ÙƒØªÙ‡.`, `Your complaint is prepared and your mail app opens to send it to ${complaintConfig.email}; you can also copy and share it.`);
  }
  const name = el('complaint-name');
  if (name && !name.value) name.value = state.form.name || state.user?.username || '';
  renderComplaintHistory();
  applyLanguage();
}
function renderComplaintHistory() {
  const host = el('complaint-history');
  if (!host) return;
  const list = Array.isArray(state.complaints) ? state.complaints : [];
  if (!list.length) {
    host.innerHTML = `<div class="empty-state"><div class="empty-icon">âœŽ</div><h3>${ui('Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¨Ù„Ø§ØºØ§Øª Ø¨Ø¹Ø¯', 'No complaints yet')}</h3><p>${ui('Ø¹Ù†Ø¯ Ø¥Ø±Ø³Ø§Ù„ Ø¨Ù„Ø§Øº Ø³ÙŠØ¸Ù‡Ø± Ù‡Ù†Ø§ Ù…Ø¹ ØªØ§Ø±ÙŠØ®Ù‡ ÙˆØ­Ø§Ù„ØªÙ‡.', 'When you send a complaint it appears here with its date and status.')}</p></div>`;
    return;
  }
  const locale = state.settings.language === 'en' ? 'en-OM' : 'ar-OM';
  host.innerHTML = `<div class="complaint-list">${list.map((item) => {
    const delivered = item.delivered ? ui('Ø£ÙØ±Ø³Ù„ Ø¥Ù„Ù‰ ÙØ±ÙŠÙ‚ Ø§Ù„ØµÙŠØ§Ù†Ø©', 'Sent to the maintenance team') : ui('Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„Ø¥Ø±Ø³Ø§Ù„ Ù…Ù† Ø¨Ø±ÙŠØ¯Ùƒ', 'Pending sending from your mail');
    const when = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(item.createdAt));
    return `<div class="complaint-row"><div class="complaint-row-top"><b>${escapeHtml(complaintCategoryLabel(item.category))}${item.subject ? ` Â· ${escapeHtml(item.subject)}` : ''}</b><span class="history-badge">${escapeHtml(delivered)}</span></div><div class="complaint-row-meta">${when} Â· ${ui('Ø±Ù‚Ù…', 'No.')} ${escapeHtml(String(item.id || '').slice(0, 8))}</div><p>${escapeHtml(item.message)}</p></div>`;
  }).join('')}</div>`;
}
function openMailto(url) {
  try {
    const link = document.createElement('a');
    link.href = url; link.rel = 'noopener'; link.style.display = 'none';
    document.body.appendChild(link); link.click(); link.remove();
    return true;
  } catch { return false; }
}
function complaintMailtoFallback(payload) {
  const lines = [
    `${ui('Ù†ÙˆØ¹ Ø§Ù„Ø¨Ù„Ø§Øº', 'Complaint type')}: ${complaintCategoryLabel(payload.category)}`,
    payload.name ? `${ui('Ø§Ù„Ø§Ø³Ù…', 'Name')}: ${payload.name}` : '',
    `${ui('ÙˆØ³ÙŠÙ„Ø© Ø§Ù„ØªÙˆØ§ØµÙ„', 'Contact')}: ${payload.contact}`,
    payload.location ? `${ui('Ø§Ù„Ù…ÙˆÙ‚Ø¹', 'Location')}: ${payload.location}` : '',
    '', payload.message,
  ].filter((line) => line !== '');
  return `mailto:${encodeURIComponent(complaintConfig.email)}?subject=${encodeURIComponent(payload.subject || ui('Ø¨Ù„Ø§Øº Ø³ÙŠØ§Ø¬', 'Siyaj complaint'))}&body=${encodeURIComponent(lines.join('\n'))}`;
}
async function submitComplaint() {
  const alertBox = el('complaint-alert');
  const success = el('complaint-success');
  const button = el('complaint-submit');
  if (alertBox) { alertBox.hidden = true; alertBox.textContent = ''; }
  if (success) { success.hidden = true; success.innerHTML = ''; }
  const payload = {
    name: (el('complaint-name')?.value || '').trim(),
    contact: (el('complaint-contact')?.value || '').trim(),
    category: el('complaint-category')?.value || 'other',
    subject: (el('complaint-subject')?.value || '').trim(),
    message: (el('complaint-message')?.value || '').trim(),
    location: state.form.location || '',
    account: currentAccount?.username || '',
  };
  const fail = (message) => { if (alertBox) { alertBox.textContent = message; alertBox.hidden = false; } };
  if (!payload.contact) return fail(ui('Ø£Ø¯Ø®Ù„ Ø¨Ø±ÙŠØ¯Ùƒ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø£Ùˆ Ø±Ù‚Ù… Ù‡Ø§ØªÙÙƒ Ù„Ù„ØªÙˆØ§ØµÙ„.', 'Enter your email or phone number for contact.'));
  if (payload.message.length < 10) return fail(ui('Ø§ÙƒØªØ¨ ÙˆØµÙØ§Ù‹ Ù„Ù„Ø¨Ù„Ø§Øº (10 Ø£Ø­Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„).', 'Describe the complaint (at least 10 characters).'));
  if (button) { button.disabled = true; button.dataset.original = button.innerHTML; button.innerHTML = `<span class="loading-inline"><i class="spinner"></i> ${ui('Ø¬Ø§Ø±Ù Ø§Ù„Ø¥Ø±Ø³Ø§Ù„â€¦', 'Sendingâ€¦')}</span>`; }
  let result = null;
  try {
    const response = await authenticatedFetch('/api/complaints', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || ui('ØªØ¹Ø°Ø± Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø¨Ù„Ø§ØºØ› Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.', 'Could not send the complaint; try again.'));
    result = data;
  } catch (error) {
    fail(error.message || ui('ØªØ¹Ø°Ø± Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø¨Ù„Ø§ØºØ› Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.', 'Could not send the complaint; try again.'));
    if (button) { button.disabled = false; if (button.dataset.original) button.innerHTML = button.dataset.original; }
    return;
  }
  const record = { id: result.id || crypto.randomUUID(), category: payload.category, subject: payload.subject, message: payload.message, contact: payload.contact, createdAt: new Date().toISOString(), delivered: !!result.delivered };
  state.complaints = [record, ...(Array.isArray(state.complaints) ? state.complaints : [])].slice(0, 30);
  persist(); renderComplaintHistory();
  if (success) {
    if (result.delivered) {
      success.innerHTML = ui(`âœ… ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø¨Ù„Ø§ØºÙƒ Ø¥Ù„Ù‰ ÙØ±ÙŠÙ‚ Ø§Ù„ØµÙŠØ§Ù†Ø© Ø¹Ù„Ù‰ ${complaintConfig.email}.`, `âœ… Your complaint was sent to the maintenance team at ${complaintConfig.email}.`);
    } else {
      const mailto = result.mailto || complaintMailtoFallback(payload);
      success.innerHTML = ui('ØªÙ… ØªØ¬Ù‡ÙŠØ² Ø¨Ù„Ø§ØºÙƒ. Ø¥Ù† Ù„Ù… ÙŠÙØªØ­ Ø¨Ø±ÙŠØ¯Ùƒ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ ÙØ§Ø¶ØºØ· Ø§Ù„Ø±Ø§Ø¨Ø· Ø§Ù„ØªØ§Ù„ÙŠØŒ Ø£Ùˆ Ø§Ø³ØªØ®Ø¯Ù… Â«Ù…Ø´Ø§Ø±ÙƒØ© / Ù†Ø³Ø® Ø§Ù„Ø¨Ù„Ø§ØºÂ».', 'Your complaint is ready. If your mail app did not open automatically, use the link below, or â€œShare / copy complaintâ€.');
      success.innerHTML += ` <a href="${mailto}">${ui('ÙØªØ­ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ù„Ø¥Ø±Ø³Ø§Ù„Ù‡', 'Open mail to send')}</a>`;
      openMailto(mailto);
    }
    success.hidden = false;
  }
  if (button) { button.disabled = false; if (button.dataset.original) button.innerHTML = button.dataset.original; }
  showToast(result.delivered ? ui('ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø¨Ù„Ø§Øº.', 'Complaint sent.') : ui('ØªÙ… ØªØ¬Ù‡ÙŠØ² Ø§Ù„Ø¨Ù„Ø§Øº Ù„Ù„Ø¥Ø±Ø³Ø§Ù„.', 'Complaint prepared for sending.'));
}
async function shareComplaint() {
  const payload = {
    category: el('complaint-category')?.value || 'other',
    subject: (el('complaint-subject')?.value || '').trim(),
    message: (el('complaint-message')?.value || '').trim(),
    name: (el('complaint-name')?.value || '').trim(),
    contact: (el('complaint-contact')?.value || '').trim(),
  };
  if (payload.message.length < 10) { const alertBox = el('complaint-alert'); if (alertBox) { alertBox.textContent = ui('Ø§ÙƒØªØ¨ ÙˆØµÙØ§Ù‹ Ù„Ù„Ø¨Ù„Ø§Øº Ù‚Ø¨Ù„ Ù…Ø´Ø§Ø±ÙƒØªÙ‡.', 'Describe the complaint before sharing it.'); alertBox.hidden = false; } return; }
  const text = `${ui('Ø¨Ù„Ø§Øº Ø³ÙŠØ§Ø¬', 'Siyaj complaint')} â€” ${complaintCategoryLabel(payload.category)}\n${payload.subject ? `${payload.subject}\n` : ''}${payload.message}\n${ui('Ø§Ù„ØªÙˆØ§ØµÙ„', 'Contact')}: ${payload.contact || 'â€”'}\n${ui('Ø¥Ù„Ù‰', 'To')}: ${complaintConfig.email}`;
  if (navigator.share) { try { await navigator.share({ title: ui('Ø¨Ù„Ø§Øº Ø³ÙŠØ§Ø¬', 'Siyaj complaint'), text }); return; } catch { /* fall through to copy */ } }
  try { await navigator.clipboard.writeText(text); showToast(ui('ØªÙ… Ù†Ø³Ø® Ù†Øµ Ø§Ù„Ø¨Ù„Ø§Øº.', 'Complaint text copied.')); }
  catch { showToast(ui('ØªØ¹Ø°Ø± Ø§Ù„Ù†Ø³Ø®Ø› Ø­Ø¯Ù‘Ø¯ Ø§Ù„Ù†Øµ ÙŠØ¯ÙˆÙŠØ§Ù‹.', 'Copy failed; select the text manually.')); }
}

// ---------- ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ù†Ø¸Ø§Ù… ----------
function reportSystemRows(f) {
  const locale = state.settings.language === 'en' ? 'en-OM' : 'ar-OM';
  const maintenance = maintenanceStatus();
  return [
    [ui('Ø§Ø³Ù… ØµØ§Ø­Ø¨ Ø§Ù„Ù†Ø¸Ø§Ù…', 'System owner'), f.name || 'â€”'],
    [ui('Ø§Ù„Ù…ÙˆÙ‚Ø¹', 'Location'), f.location || ui('ØºÙŠØ± Ù…Ø­Ø¯Ø¯', 'Not set')],
    [ui('Ø¹Ø¯Ø¯ Ø§Ù„Ø£Ù„ÙˆØ§Ø­', 'Panel count'), f.panels ? `${f.panels}` : 'â€”'],
    [ui('Ø§Ù„Ù‚Ø¯Ø±Ø© Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠØ©', 'Total capacity'), f.power ? `${f.power} ${ui('ÙˆØ§Ø·', 'W')}` : 'â€”'],
    [ui('Ù†ÙˆØ¹ Ø§Ù„Ø£Ù„ÙˆØ§Ø­', 'Panel type'), ({ monocrystalline: ui('Ø£Ø­Ø§Ø¯ÙŠØ© Ø§Ù„Ø¨Ù„ÙˆØ±Ø©', 'Monocrystalline'), polycrystalline: ui('Ù…ØªØ¹Ø¯Ø¯Ø© Ø§Ù„Ø¨Ù„ÙˆØ±Ø§Øª', 'Polycrystalline'), 'thin-film': ui('Ø£ØºØ´ÙŠØ© Ø±Ù‚ÙŠÙ‚Ø©', 'Thin film'), unknown: ui('ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ', 'Unknown') })[f.panelType] || 'â€”'],
    [ui('Ø´Ø±ÙƒØ© Ø§Ù„Ø£Ù„ÙˆØ§Ø­', 'Panel company'), f.company || 'â€”'],
    [ui('Ø§Ù„Ù…ØµÙ†Ø¹', 'Manufacturer'), f.brand || 'â€”'],
    [ui('Ù…ÙŠÙ„ Ø§Ù„Ø£Ù„ÙˆØ§Ø­', 'Panel tilt'), f.tilt !== '' && f.tilt !== null ? `${f.tilt}Â°` : 'â€”'],
    [ui('Ø§ØªØ¬Ø§Ù‡ Ø§Ù„Ø£Ù„ÙˆØ§Ø­', 'Panel azimuth'), f.panelAzimuth !== '' && f.panelAzimuth !== null ? `${f.panelAzimuth}Â°` : 'â€”'],
    [ui('Ø¢Ø®Ø± ØµÙŠØ§Ù†Ø©', 'Last maintenance'), maintenance ? maintenanceDateLabel(maintenance.last, locale) : ui('Ù„Ù… ØªÙØ³Ø¬Ù„', 'Not recorded')],
    [ui('Ù…ÙˆØ¹Ø¯ Ø§Ù„ØµÙŠØ§Ù†Ø© Ø§Ù„Ù‚Ø§Ø¯Ù…Ø©', 'Next maintenance'), maintenance ? `${maintenanceDateLabel(maintenance.due, locale)} Â· ${maintenanceRemainingLabel(maintenance)}` : ui('Ø£Ø¶Ù ØªØ§Ø±ÙŠØ® Ø¢Ø®Ø± ØµÙŠØ§Ù†Ø©', 'Add the last maintenance date')],
    [ui('Ù‚ÙŠÙ…Ø© Ø§Ù„ÙØ§ØªÙˆØ±Ø©', 'Bill amount'), f.invoice ? `${f.invoice} ${ui('Ø±.Ø¹', 'OMR')}` : 'â€”'],
    [ui('Ø´Ù‡Ø± Ø§Ù„ÙØ§ØªÙˆØ±Ø©', 'Bill month'), f.billMonth || 'â€”'],
  ];
}
function renderSystemReport() {
  const host = el('system-report-body');
  if (!host) return;
  const f = state.form;
  const result = state.result || (f.power ? calculateLoss() : null);
  ensureLossBreakdown(result);
  const current = state.weather?.current;
  const monthly = state.monthlyLoss;
  const locale = state.settings.language === 'en' ? 'en-OM' : 'ar-OM';
  const generated = new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'short' }).format(new Date());
  const heat = result?.heatPercent === null || result?.heatPercent === undefined ? null : Math.round(Number(result.heatPercent));
  const dust = result?.dustPercent === null || result?.dustPercent === undefined ? 'â€”' : `${Math.round(Number(result.dustPercent))}%`;
  const shade = Number.isFinite(Number(result?.shadePercent)) ? `${Math.round(Number(result.shadePercent))}%` : '0%';
  const total = Number.isFinite(Number(result?.totalPercent)) ? Number(result.totalPercent) : 'â€”';
  const lossDay = result && Number.isFinite(Number(result.lostKwh)) ? `${result.lostKwh.toFixed(2)} kWh` : 'â€”';
  const lossMoney = result && Number.isFinite(Number(result.lostMoney)) ? money(result.lostMoney) : 'â€”';
  const owner = state.user?.username || f.name || ui('Ù…Ø³ØªØ®Ø¯Ù… Ø³ÙŠØ§Ø¬', 'Siyaj user');
  const monthlyLine = monthly && monthly.lostKwh !== null && monthly.lostKwh !== undefined
    ? `${Number(monthly.lostKwh).toFixed(2)} kWh${monthly.lossMoney !== null && monthly.lossMoney !== undefined ? ` Â· ${money(monthly.lossMoney)}` : ''}`
    : ui('ØºÙŠØ± Ù…Ø­Ø³ÙˆØ¨Ø© (Ø£Ø¶Ù Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ø§Ù„Ù…ØªÙˆÙ‚Ø¹ ÙˆØ§Ù„ÙØ¹Ù„ÙŠ)', 'Not calculated (add expected and actual generation)');
  const weatherRows = current ? [
    [ui('Ø§Ù„Ø­Ø±Ø§Ø±Ø©', 'Temperature'), `${Math.round(current.temperature_2m)}Â°${ui('Ù…', 'C')}`],
    [ui('Ø§Ù„Ø±Ø·ÙˆØ¨Ø©', 'Humidity'), `${Math.round(current.relative_humidity_2m)}%`],
    [ui('Ø§Ù„Ø­Ø§Ù„Ø©', 'Condition'), weatherText(current.weather_code)],
    [ui('Ø§Ù„Ù…Ù†Ø·Ù‚Ø© Ø§Ù„Ø²Ù…Ù†ÙŠØ©', 'Time zone'), state.weather?.timezone || 'â€”'],
  ] : [[ui('Ø§Ù„Ø·Ù‚Ø³', 'Weather'), ui('ØºÙŠØ± Ù…ØªØ§Ø­', 'Unavailable')]];
  const advice = result && !result.heatEstimateUnavailable
    ? [
      heat !== null && heat >= 10 ? [ui('Ø§Ù„Ø­Ø±Ø§Ø±Ø©', 'Heat'), ui('Ø­Ø±Ø§Ø±Ø© Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø§Ù„Ù…Ø±ØªÙØ¹Ø© ØªØ®ÙØ¶ Ø§Ù„Ø¥Ù†ØªØ§Ø¬Ø› Ø±Ø§Ù‚Ø¨ Ø§Ù„ØªÙ‡ÙˆÙŠØ© ÙˆÙˆÙ‚Øª Ø§Ù„ØªØ´ØºÙŠÙ„ ÙˆØªØ¬Ù†Ø¨ Ø§Ù„Ø¹Ù…Ù„ ÙˆÙ‚Øª Ø§Ù„Ø°Ø±ÙˆØ©.', 'High panel heat lowers output; check ventilation and avoid working at peak heat.')] : null,
      Number(result.dustPercent) >= 15 ? [ui('Ø§Ù„ØºØ¨Ø§Ø±', 'Dust'), ui('ÙŠØ¸Ù‡Ø± ØªØ±Ø§ÙƒÙ… ØºØ¨Ø§Ø± Ù…Ù„Ø­ÙˆØ¸Ø› Ù†Ø¸Ù‘Ù Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø¨Ø£Ù…Ø§Ù† ÙˆÙƒØ±Ù‘Ø± Ø§Ù„ÙØ­Øµ.', 'Notable dust is shown; clean the panels safely and re-inspect.')] : null,
      [ui('Ø§Ù„ØªÙˆØµÙŠØ©', 'Recommendation'), ui('Ø­Ø§ÙØ¸ Ø¹Ù„Ù‰ ÙØ­Øµ Ø¯ÙˆØ±ÙŠ Ù„Ù„Ø·Ù‚Ø³ ÙˆØ³Ø·Ø­ Ø§Ù„Ø£Ù„ÙˆØ§Ø­ Ø¨Ø¹Ø¯ Ø§Ù„Ø¹ÙˆØ§ØµÙ Ø£Ùˆ ÙØªØ±Ø§Øª Ø§Ù„ØºØ¨Ø§Ø±.', 'Keep checking weather and panel surfaces after storms or dusty periods.')],
    ].filter(Boolean) : [[ui('Ø§Ù„ØªÙˆØµÙŠØ©', 'Recommendation'), ui('Ø£Ø¯Ø®Ù„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù… ÙˆØ£Ø±ÙÙ‚ ØµÙˆØ±Ø© Ù„Ù„Ø£Ù„ÙˆØ§Ø­ Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ ØªÙ‚Ø±ÙŠØ± Ø£Ø¯Ù‚.', 'Enter system data and attach a panel photo for a more accurate report.')]];
  host.innerHTML = `
    <div class="report-header">
      <div>
        <p class="eyebrow">${ui('Ø³ÙŠØ§Ø¬ Â· Ø±ÙÙŠÙ‚ Ø§Ù„Ø·Ø§Ù‚Ø© Ø§Ù„Ø´Ù…Ø³ÙŠØ©', 'Siyaj Â· Solar companion')}</p>
        <h2>${ui('ØªÙ‚Ø±ÙŠØ± Ø­Ø§Ù„Ø© Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø´Ù…Ø³ÙŠ', 'Solar system status report')}</h2>
        <p>${ui('ØµØ¯Ø± ÙÙŠ', 'Generated on')} ${escapeHtml(generated)} Â· ${ui('Ø§Ù„Ø­Ø³Ø§Ø¨', 'Account')}: ${escapeHtml(owner)}</p>
      </div>
      <span class="report-logo"><img src="/assets/logo.png" alt=""></span>
    </div>
    <section class="report-section">
      <h3>${ui('Ù…Ù„Ø®Øµ Ø§Ù„Ø£Ø¯Ø§Ø¡', 'Performance summary')}</h3>
      <div class="report-highlight">
        <div><small>${ui('Ù†Ø³Ø¨Ø© Ø§Ù„ÙÙ‚Ø¯ Ø§Ù„ØªÙ‚Ø¯ÙŠØ±ÙŠØ©', 'Estimated loss ratio')}</small><b>${total === 'â€”' ? 'â€”' : `${total}%`}</b></div>
        <div><small>${ui('Ø§Ù„Ø·Ø§Ù‚Ø© Ø§Ù„Ù…ÙÙ‚ÙˆØ¯Ø© ÙŠÙˆÙ…ÙŠØ§Ù‹', 'Energy lost per day')}</small><b>${escapeHtml(lossDay)}</b></div>
        <div><small>${ui('Ø§Ù„Ù‚ÙŠÙ…Ø© Ø§Ù„ØªÙ‚Ø¯ÙŠØ±ÙŠØ©', 'Estimated value')}</small><b>${escapeHtml(lossMoney)}</b></div>
      </div>
    </section>
    <section class="report-section">
      <h3>${ui('Ø£Ø³Ø¨Ø§Ø¨ Ø§Ù„ÙÙ‚Ø¯', 'Loss breakdown')}</h3>
      <table class="report-table">
        <tr><th>${ui('Ø§Ù„Ù…ØµØ¯Ø±', 'Source')}</th><th>${ui('Ø§Ù„Ù†Ø³Ø¨Ø© Ø§Ù„ØªÙ‚Ø¯ÙŠØ±ÙŠØ©', 'Estimated share')}</th></tr>
        <tr><td>${ui('Ø§Ù„Ø­Ø±Ø§Ø±Ø©', 'Heat')}</td><td>${heat === null ? 'â€”' : `${heat}%`}</td></tr>
        <tr><td>${ui('Ø§Ù„ØºØ¨Ø§Ø±', 'Dust')}</td><td>${escapeHtml(dust)}</td></tr>
        <tr><td>${ui('Ø§Ù„Ø¸Ù„', 'Shade')}</td><td>${shade}</td></tr>
        <tr><td><b>${ui('Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ', 'Total')}</b></td><td><b>${total === 'â€”' ? 'â€”' : `${total}%`}</b></td></tr>
      </table>
      <p class="report-advice-note" style="margin-top:12px">${ui('Ø§Ù„ÙÙ‚Ø¯ Ø§Ù„Ù„Ø­Ø¸ÙŠ Ø¨Ø³Ø¨Ø¨ Ø­Ø±Ø§Ø±Ø© Ø§Ù„Ø£Ù„ÙˆØ§Ø­ ÙˆÙ‚Øª Ø§Ù„ÙØ­Øµ: ', 'Instantaneous loss from panel heat at inspection: ')}<b>${heat === null ? 'â€”' : `${heat}%`}</b> Â· ${ui('Ø§Ù„Ø®Ø³Ø§Ø±Ø© Ø§Ù„Ø´Ù‡Ø±ÙŠØ© (Ù…ØªÙˆÙ‚Ø¹ âˆ’ ÙØ¹Ù„ÙŠ): ', 'Monthly loss (expected âˆ’ actual): ')}<b>${escapeHtml(monthlyLine)}</b></p>
    </section>
    <section class="report-section">
      <h3>${ui('Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù…', 'System details')}</h3>
      <table class="report-table">${reportSystemRows(f).map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join('')}</table>
    </section>
    <section class="report-section">
      <h3>${ui('Ø§Ù„Ø·Ù‚Ø³ ÙˆÙ‚Øª Ø§Ù„ØªÙ‚Ø±ÙŠØ±', 'Weather at report time')}</h3>
      <table class="report-table">${weatherRows.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join('')}</table>
    </section>
    <section class="report-section">
      <h3>${ui('Ø§Ù„ØªÙˆØµÙŠØ©', 'Recommendation')}</h3>
      <div class="report-advice">${advice.map(([label, text]) => `<h4>${escapeHtml(label)}</h4><p>${escapeHtml(text)}</p>`).join('')}<p class="report-advice-note">${ui('Ù‡Ø°Ø§ Ø§Ù„ØªÙ‚Ø±ÙŠØ± ØªÙ‚Ø¯ÙŠØ±ÙŠ ÙˆÙŠØ³ØªÙ†Ø¯ Ø¥Ù„Ù‰ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø¯Ø®Ù„Ø© ÙˆÙ†Ù…Ø§Ø°Ø¬ Ø§Ù„Ø·Ù‚Ø³ØŒ ÙˆÙ„ÙŠØ³ Ù‚ÙŠØ§Ø³Ø§Ù‹ ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠØ§Ù‹ Ù…Ø¨Ø§Ø´Ø±Ø§Ù‹. ÙŠÙ…ÙƒÙ† Ù…Ø´Ø§Ø±ÙƒØªÙ‡ Ù…Ø¹ Ø´Ø±ÙƒØ© Ø§Ù„ØµÙŠØ§Ù†Ø©.', 'This report is an estimate based on entered data and weather models, not a direct electrical measurement. It can be shared with a maintenance company.')}</p></div>
    </section>
    <div class="report-footer"><span>${ui('Ø³ÙŠØ§Ø¬ | Ø±ÙÙŠÙ‚ Ø§Ù„Ø·Ø§Ù‚Ø© Ø§Ù„Ø´Ù…Ø³ÙŠØ©', 'Siyaj | Solar companion')}</span></div>`;
  applyLanguage();
}
function reportPlainText() {
  const f = state.form;
  const result = state.result || (f.power ? calculateLoss() : null);
  ensureLossBreakdown(result);
  const locale = state.settings.language === 'en' ? 'en-OM' : 'ar-OM';
  const lines = [
    ui('ØªÙ‚Ø±ÙŠØ± Ø­Ø§Ù„Ø© Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø´Ù…Ø³ÙŠ â€” Ø³ÙŠØ§Ø¬', 'Solar system status report â€” Siyaj'),
    `${ui('ØµØ¯Ø± ÙÙŠ', 'Generated on')} ${new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'short' }).format(new Date())}`,
    '',
    `${ui('Ù†Ø³Ø¨Ø© Ø§Ù„ÙÙ‚Ø¯ Ø§Ù„ØªÙ‚Ø¯ÙŠØ±ÙŠØ©', 'Estimated loss ratio')}: ${result ? `${result.percent}%` : 'â€”'}`,
    `${ui('Ø§Ù„Ø·Ø§Ù‚Ø© Ø§Ù„Ù…ÙÙ‚ÙˆØ¯Ø© ÙŠÙˆÙ…ÙŠØ§Ù‹', 'Energy lost per day')}: ${result && Number.isFinite(Number(result.lostKwh)) ? `${result.lostKwh.toFixed(2)} kWh` : 'â€”'}`,
    `${ui('Ø§Ù„Ù‚ÙŠÙ…Ø© Ø§Ù„ØªÙ‚Ø¯ÙŠØ±ÙŠØ©', 'Estimated value')}: ${result && Number.isFinite(Number(result.lostMoney)) ? money(result.lostMoney) : 'â€”'}`,
    '',
    `${ui('Ø§Ù„Ø­Ø±Ø§Ø±Ø©', 'Heat')}: ${result && result.heatPercent !== null && result.heatPercent !== undefined ? `${Math.round(result.heatPercent)}%` : 'â€”'}`,
    `${ui('Ø§Ù„ØºØ¨Ø§Ø±', 'Dust')}: ${result && result.dustPercent !== null && result.dustPercent !== undefined ? `${Math.round(result.dustPercent)}%` : 'â€”'}`,
    `${ui('Ø§Ù„Ø¸Ù„', 'Shade')}: ${result && Number.isFinite(Number(result.shadePercent)) ? `${Math.round(result.shadePercent)}%` : '0%'}`,
    '',
    ...reportSystemRows(f).map(([label, value]) => `${label}: ${value}`),
  ];
  return lines.join('\n');
}
function downloadReport() {
  renderSystemReport();
  const previous = document.body.classList.contains('print-report');
  const previousTitle = document.title;
  const stamp = new Date().toISOString().slice(0, 10);
  document.body.classList.add('print-report');
  // ÙŠØ³ØªØ®Ø¯Ù… Ø§Ù„Ù…ØªØµÙØ­ Ø¹Ù†ÙˆØ§Ù† Ø§Ù„ØµÙØ­Ø© ÙƒØ§Ø³Ù… Ù…Ù‚ØªØ±Ø­ Ù„Ù…Ù„Ù PDF Ø¹Ù†Ø¯ Ø§Ù„Ø­ÙØ¸.
  document.title = `Siyaj-report-${stamp}`;
  const cleanup = () => {
    document.title = previousTitle;
    if (!previous) document.body.classList.remove('print-report');
  };
  window.addEventListener('afterprint', cleanup, { once: true });
  try { window.print(); } catch { showToast(ui('ØªØ¹Ø°Ø± ÙØªØ­ Ù†Ø§ÙØ°Ø© Ø§Ù„Ø·Ø¨Ø§Ø¹Ø©.', 'Could not open the print dialog.')); }
  setTimeout(cleanup, 1500);
}
async function shareReport() {
  const text = reportPlainText();
  if (navigator.share) { try { await navigator.share({ title: ui('ØªÙ‚Ø±ÙŠØ± Ø­Ø§Ù„Ø© Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø´Ù…Ø³ÙŠ â€” Ø³ÙŠØ§Ø¬', 'Solar system status report â€” Siyaj'), text }); return; } catch { /* fall through to copy */ } }
  try { await navigator.clipboard.writeText(text); showToast(ui('ØªÙ… Ù†Ø³Ø® Ø§Ù„ØªÙ‚Ø±ÙŠØ±Ø› ÙŠÙ…ÙƒÙ†Ùƒ Ù„ØµÙ‚Ù‡ ÙÙŠ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø£Ùˆ ÙˆØ§ØªØ³Ø§Ø¨.', 'Report copied; paste it into email or WhatsApp.')); }
  catch { showToast(ui('ØªØ¹Ø°Ø± Ø§Ù„Ù†Ø³Ø®Ø› Ø§Ø³ØªØ®Ø¯Ù… Â«ØªÙ†Ø²ÙŠÙ„ PDFÂ».', 'Copy failed; use â€œDownload PDFâ€.')); }
}
function decodeVapidKey(value) {
  const padding = '='.repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}
async function getDevicePushSubscription() {
  if (!('serviceWorker' in navigator)) return null;
  const registration = await navigator.serviceWorker.getRegistration('/');
  return registration?.pushManager ? registration.pushManager.getSubscription() : null;
}
async function refreshDevicePushState() {
  const accountId = currentAccount?.id;
  if (!accountId) { devicePushEnabled = false; devicePushStateKnown = true; return; }
  const subscription = await getDevicePushSubscription();
  let enabled = false;
  if (subscription && 'Notification' in window && Notification.permission === 'granted') {
    const response = await authenticatedFetch('/api/push/status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'ØªØ¹Ø°Ø± Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ù‡Ø°Ø§ Ø§Ù„Ø¬Ù‡Ø§Ø².');
    enabled = !!data.subscribed;
  }
  if (accountId !== currentAccount?.id) return;
  devicePushEnabled = enabled; devicePushStateKnown = true;
  if (!el('page-settings').hidden) renderSettings();
}
async function enablePushNotifications() {
  if (!currentAccount?.id) throw new Error('Ø³Ø¬Ù‘Ù„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø£ÙˆÙ„Ø§Ù‹ Ù„ØªÙØ¹ÙŠÙ„ Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª.');
  if (!('Notification' in window) || !('serviceWorker' in navigator)) throw new Error('Ù‡Ø°Ø§ Ø§Ù„Ù…ØªØµÙØ­ Ù„Ø§ ÙŠØ¯Ø¹Ù… ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Push.');
  const configResponse = await fetch('/api/push/config');
  const config = await configResponse.json();
  if (!configResponse.ok || !config.enabled || !config.publicKey) throw new Error('Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª ØªØ¹Ù…Ù„ Ø¨Ø¹Ø¯ Ø¥Ø¶Ø§ÙØ© Ù…ÙØ§ØªÙŠØ­ VAPID ÙˆØªØ´ØºÙŠÙ„ Ø§Ù„Ø®Ø§Ø¯Ù….');
  if (Notification.permission !== 'granted' && await Notification.requestPermission() !== 'granted') throw new Error('Ù„Ù… ÙŠØªÙ… ØªÙØ¹ÙŠÙ„ Ø¥Ø°Ù† Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª.');
  await navigator.serviceWorker.register('/sw.js');
  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: decodeVapidKey(config.publicKey) });
  const response = await authenticatedFetch('/api/push/subscribe', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: subscription.toJSON() }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'ØªØ¹Ø°Ø± Ø­ÙØ¸ Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ Ø¨Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª.');
  devicePushEnabled = true; devicePushStateKnown = true;
}
async function disablePushNotifications() {
  const subscription = await getDevicePushSubscription();
  if (!subscription) { devicePushEnabled = false; devicePushStateKnown = true; return; }
  const response = await authenticatedFetch('/api/push/unsubscribe', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'ØªØ¹Ø°Ø± Ø¥ÙŠÙ‚Ø§Ù ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ù‡Ø°Ø§ Ø§Ù„Ø¬Ù‡Ø§Ø².');
  devicePushEnabled = false; devicePushStateKnown = true;
  if (!await subscription.unsubscribe()) throw new Error('ØªØ¹Ø°Ø± Ø¥ÙŠÙ‚Ø§Ù ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ù‡Ø°Ø§ Ø§Ù„Ø¬Ù‡Ø§Ø².');
}
let authMode = 'login';
const ACCOUNTS_KEY = 'siyaj.localAccounts.v1';
function readAccounts() {
  let accounts;
  try { accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]'); } catch { accounts = []; }
  if (!Array.isArray(accounts)) accounts = [];
  let changed = false;
  const usedNames = new Set();
  for (const account of accounts) {
    if (!account.id) { account.id = crypto.randomUUID(); changed = true; }
    account.email = String(account.email || '').toLowerCase();
    account.phoneKey ||= normalizedPhone(account.phone);
    const proposed = account.username || account.name || account.email.split('@')[0] || 'user';
    let username = makeUniqueUsername(proposed, usedNames);
    if (account.username !== username) { account.username = username; changed = true; }
    const usernameKey = normalizedUsername(username);
    if (account.usernameKey !== usernameKey) { account.usernameKey = usernameKey; changed = true; }
    account.name ||= account.username;
    account.provider ||= account.googleSub ? 'google' : 'password';
    usedNames.add(usernameKey);
  }
  if (changed) localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  return accounts;
}
function normalizedPhone(value) { return String(value || '').replace(/[^\d+]/g, ''); }
function normalizedUsername(value) { return String(value || '').normalize('NFKC').trim().toLocaleLowerCase(); }
function makeUniqueUsername(value, usedNames) {
  let base = String(value || 'user').normalize('NFKC').trim().replace(/[^\p{L}\p{N}._-]/gu, '_').replace(/^[_\.-]+|[_\.-]+$/g, '');
  if (base.length < 3) base = `user_${base || 'siyaj'}`;
  base = base.slice(0, 24);
  let candidate = base; let suffix = 2;
  while (usedNames.has(normalizedUsername(candidate))) {
    const ending = `_${suffix++}`;
    candidate = `${base.slice(0, 24 - ending.length)}${ending}`;
  }
  return candidate;
}
function bytesToHex(bytes) { return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join(''); }
async function passwordDigest(password, saltHex) {
  if (!crypto.subtle) throw new Error('ÙŠØªØ·Ù„Ø¨ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø­Ø³Ø§Ø¨ Ù…ØªØµÙØ­Ø§Ù‹ Ø¢Ù…Ù†Ø§Ù‹ Ù…Ø«Ù„ localhost.');
  const salt = Uint8Array.from(saltHex.match(/.{1,2}/g) || [], (byte) => parseInt(byte, 16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const digest = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, key, 256);
  return bytesToHex(new Uint8Array(digest));
}
function setAuthMode(mode) {
  authMode = mode;
  el('login-form').hidden = mode !== 'login' || !!state.user;
  el('signup-form').hidden = mode !== 'signup' || !!state.user;
  el('auth-tab-login').classList.toggle('active', mode === 'login');
  el('auth-tab-signup').classList.toggle('active', mode === 'signup');
  applyLanguage();
}
function renderAuth() {
  const loggedIn = !!state.user;
  el('auth-profile').hidden = !loggedIn;
  el('auth-tabs').hidden = loggedIn;
  el('login-form').hidden = loggedIn || authMode !== 'login';
  el('signup-form').hidden = loggedIn || authMode !== 'signup';
  if (loggedIn) {
    el('profile-name').textContent = state.user.username || state.user.name || state.user.email;
    el('profile-email').textContent = state.user.email;
  }
  applyLanguage();
}
async function finishServerAuth(session, seedState = null, legacyAccountId = '') {
  resetAiRequests();
  try { await moveLegacyMedia(legacyAccountId, session.user.id); } catch { /* keep server sign-in available if local files cannot be moved */ }
  currentAccount = session.user;
  const remoteResponse = await authenticatedFetch('/api/account/state');
  if (!remoteResponse.ok) throw new Error((await remoteResponse.json()).error || 'ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø¨.');
  const remote = await remoteResponse.json();
  state = normalizeState(remote.state || seedState);
  state.user = { ...session.user };
  devicePushEnabled = false; devicePushStateKnown = false;
  await refreshDevicePushState().catch(() => { devicePushStateKnown = false; });
  currentStep = 0;
  media = [];
  persist();
  renderAuth();
}
async function continueAfterAuth() {
  await loadMedia();
  renderDashboard();
  if (state.onboarded) showPage('dashboard'); else openWizard(0);
  if (state.form.latitude !== null && state.form.longitude !== null) await loadWeather();
}
async function handleSignup(event) {
  event.preventDefault();
  const username = el('signup-username').value.trim();
  const email = el('signup-email').value.trim().toLowerCase();
  const phone = el('signup-phone').value.trim();
  const phoneKey = normalizedPhone(phone);
  const password = el('signup-password').value;
  const confirmPassword = el('signup-confirm').value;
  if (!/^[\p{L}\p{N}._-]{3,24}$/u.test(username)) return showToast('Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ù…Ù† 3 Ø¥Ù„Ù‰ 24 Ø­Ø±ÙØ§Ù‹ Ø£Ùˆ Ø±Ù‚Ù…Ø§Ù‹ØŒ ÙˆÙŠÙ…ÙƒÙ† Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù†Ù‚Ø·Ø© ÙˆØ§Ù„Ø´Ø±Ø·Ø© Ø§Ù„Ø³ÙÙ„ÙŠØ© ÙÙ‚Ø·.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showToast('Ø£Ø¯Ø®Ù„ Ø¨Ø±ÙŠØ¯Ø§Ù‹ Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØ§Ù‹ ØµØ§Ù„Ø­Ø§Ù‹.');
  if (phoneKey.replace(/\D/g, '').length < 7) return showToast('Ø£Ø¯Ø®Ù„ Ø±Ù‚Ù… Ù‡Ø§ØªÙ ØµØ§Ù„Ø­Ø§Ù‹.');
  if (password.length < 8) return showToast('ÙŠØ¬Ø¨ Ø£Ù† ØªØªÙƒÙˆÙ† ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ù…Ù† 8 Ø£Ø­Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„.');
  if (password !== confirmPassword) return showToast('ÙƒÙ„Ù…ØªØ§ Ø§Ù„Ù…Ø±ÙˆØ± ØºÙŠØ± Ù…ØªØ·Ø§Ø¨Ù‚ØªÙŠÙ†.');
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, phone, password }),
    });
    const session = await response.json();
    if (!response.ok) throw new Error(session.error || 'ØªØ¹Ø°Ø± Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨.');
    await finishServerAuth(session, state); const signupDev = session?.user?.role === 'developer'; showToast(signupDev ? 'Welcome dev' : ('ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨ ÙˆØ­ÙØ¸Ù‡ Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø§Ø¯Ù….')); await continueAfterAuth();
  } catch (error) { showToast(error.message || 'ØªØ¹Ø°Ø± Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨.'); }
}
async function handleLogin(event) {
  event.preventDefault();
  const identifier = el('login-identifier').value.trim();
  const password = el('login-password').value;
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    let session = await response.json();
    let seedState = null;
    if (!response.ok && response.status === 401) {
      const normalized = normalizedUsername(identifier);
      const legacy = readAccounts().find((item) => item.email === identifier.toLowerCase() || item.phoneKey === normalizedPhone(identifier) || item.usernameKey === normalized);
      if (legacy?.salt && legacy?.hash) {
        const legacyHash = await passwordDigest(password, legacy.salt);
        if (legacyHash !== legacy.hash) return showToast('ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ØºÙŠØ± ØµØ­ÙŠØ­Ø©.');
        seedState = loadState(accountStorageKey(legacy.id));
        const migration = await fetch('/api/auth/signup', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: legacy.username, email: legacy.email, phone: legacy.phone, password }),
        });
        session = await migration.json();
        if (!migration.ok) throw new Error(session.error || 'ØªØ¹Ø°Ø± Ù†Ù‚Ù„ Ø§Ù„Ø­Ø³Ø§Ø¨ Ø¥Ù„Ù‰ Ø§Ù„Ø®Ø§Ø¯Ù….');
      } else if (legacy && !legacy.salt) return showToast('Ù‡Ø°Ø§ Ø§Ù„Ø­Ø³Ø§Ø¨ Ù…Ø±ØªØ¨Ø· Ø¨Ù€ GoogleØ› ØªØ§Ø¨Ø¹ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Google.');
      else throw new Error(session.error || 'Ù„Ù… Ù†Ø¹Ø«Ø± Ø¹Ù„Ù‰ Ø§Ù„Ø­Ø³Ø§Ø¨. Ø£Ù†Ø´Ø¦ Ø­Ø³Ø§Ø¨Ø§Ù‹ Ø¬Ø¯ÙŠØ¯Ø§Ù‹.');
    } else if (!response.ok) throw new Error(session.error || 'ØªØ¹Ø°Ø± ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„.');
    const legacy = readAccounts().find((item) => item.email === identifier.toLowerCase() || item.phoneKey === normalizedPhone(identifier) || item.usernameKey === normalizedUsername(identifier));
    await finishServerAuth(session, seedState, legacy?.id); const loginDev = session?.user?.role === 'developer'; showToast(loginDev ? 'Welcome dev' : 'Login successful.'); await continueAfterAuth();
  } catch (error) { showToast(error.message || 'ØªØ¹Ø°Ø± ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„.'); }
}
let googleSignInReady = false;
function renderGoogleButtons() {
  if (!googleSignInReady || !window.google?.accounts?.id) return;
  document.querySelectorAll('[data-google-signin]').forEach((container) => {
    container.replaceChildren();
    const width = Math.max(220, Math.min(360, Math.floor(container.getBoundingClientRect().width || 360)));
    window.google.accounts.id.renderButton(container, {
      type: 'standard', theme: 'outline', size: 'large', text: 'continue_with', shape: 'rectangular',
      width, locale: state.settings.language === 'en' ? 'en' : 'ar',
    });
  });
}
async function handleGoogleCredential(response) {
  try {
    const verification = await fetch('/api/auth/google', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response?.credential || '' }),
    });
    const data = await verification.json();
    if (!verification.ok) throw new Error(data.error || 'ØªØ¹Ø°Ø± Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø­Ø³Ø§Ø¨ Google.');
    const legacy = readAccounts().find((item) => item.email === data.user?.email);
    const seedState = legacy ? loadState(accountStorageKey(legacy.id)) : null;
    await finishServerAuth(data, seedState, legacy?.id); showToast('ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Google ÙˆÙ…Ø²Ø§Ù…Ù†Ø© Ø¨ÙŠØ§Ù†Ø§ØªÙƒ.'); await continueAfterAuth();
  } catch (error) { showToast(error.message || 'ØªØ¹Ø°Ø± ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Google.'); }
}
async function initializeGoogleButtons() {
  try {
    const config = await loadAiConfig();
    if (!config.googleClientId) return;
    if (!window.google?.accounts?.id) {
      await new Promise((resolve) => {
        const script = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
        if (!script) return resolve();
        script.addEventListener('load', resolve, { once: true });
        script.addEventListener('error', resolve, { once: true });
        setTimeout(resolve, 10000);
      });
    }
    if (!window.google?.accounts?.id) return;
    window.google.accounts.id.initialize({ client_id: config.googleClientId, callback: handleGoogleCredential, auto_select: false });
    googleSignInReady = true;
    renderGoogleButtons();
  } catch { /* keep the local Google button fallback visible */ }
}
// The intro and the loading screen are always shown in the light theme. The account's
// saved dark/light preference is only applied once the intro has left the screen, so
// the theme never flips while the branding is still animating.
function applyTheme() {
  if (introActive) return;
  document.body.classList.toggle('dark', !!state.settings.dark);
}
// How long the logo rests in the centre of the intro before flying to the header,
// and how long that flight takes. INTRO_FLIGHT_MS must match the .intro-logo.moving
// transition duration in styles.css so the fade-out starts exactly when it lands.
const INTRO_HOLD_MS = 4600;
const INTRO_FLIGHT_MS = 760;
function playIntro() {
  introActive = true;
  // The logo travels from the centre of the intro to the header logo. Capture both
  // positions from the top of the page so a scrolled window can never send the logo
  // off-screen, and so it always lands exactly on the logo the user sees in the header.
  const intro = el('intro'); const logo = intro.querySelector('.intro-logo');
  const start = logo.getBoundingClientRect();
  el('app-shell').hidden = false; el('app-shell').style.animation = 'none';
  showPage('auth'); renderAuth(); syncHeader();
  initializeGoogleButtons();
  setTimeout(() => {
    window.scrollTo(0, 0);
    intro.classList.add('transitioning');
    const destination = document.querySelector('.brand img').getBoundingClientRect();
    const spacer = document.createElement('span');
    spacer.className = 'intro-logo-spacer';
    spacer.setAttribute('aria-hidden', 'true');
    spacer.style.width = `${start.width}px`;
    spacer.style.height = `${start.height}px`;
    logo.before(spacer);
    logo.classList.add('moving'); logo.style.top = `${start.top}px`; logo.style.left = `${start.left}px`;
    logo.style.width = `${start.width}px`; logo.style.height = `${start.height}px`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      logo.style.top = `${destination.top}px`; logo.style.left = `${destination.left}px`;
      logo.style.width = `${destination.width}px`; logo.style.height = `${destination.height}px`;
    }));
    setTimeout(() => { intro.classList.add('leaving'); setTimeout(() => { intro.hidden = true; introActive = false; applyTheme(); if (!bootstrapSettled) showLoadingScreen(); }, 190); }, INTRO_FLIGHT_MS + 80);
  }, INTRO_HOLD_MS);
}
function setupEvents() {
  document.querySelectorAll('[data-page]').forEach((button) => button.addEventListener('click', () => { const page = button.dataset.page; showPage(page); if (page === 'history') renderHistory(); if (page === 'reports') renderReports(); if (page === 'report') renderSystemReport(); if (page === 'settings') { renderSettings(); refreshDevicePushState().catch(() => { devicePushStateKnown = false; renderSettings(); }); } if (page === 'auth') renderAuth(); }));
  el('mobile-menu').addEventListener('click', () => document.body.classList.toggle('mobile-nav-open'));
  el('language-toggle').addEventListener('click', () => {
    state.settings.language = state.settings.language === 'en' ? 'ar' : 'en'; persist();
    renderDashboard(); renderCurrentStep(); renderHistory(); renderSettings(); renderAuth(); showToast(state.settings.language === 'en' ? 'Language changed to English.' : 'ØªÙ… ØªØºÙŠÙŠØ± Ø§Ù„Ù„ØºØ© Ø¥Ù„Ù‰ Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©.');
    renderGoogleButtons();
  });
  el('auth-tab-login').addEventListener('click', () => setAuthMode('login'));
  el('auth-tab-signup').addEventListener('click', () => setAuthMode('signup'));
  el('show-signup').addEventListener('click', () => setAuthMode('signup'));
  el('show-login').addEventListener('click', () => setAuthMode('login'));
  el('login-form').addEventListener('submit', handleLogin);
  el('signup-form').addEventListener('submit', handleSignup);
  el('logout-button').addEventListener('click', async () => {
    resetAiRequests();
    const button = el('logout-button'); button.disabled = true;
    try {
      persist(); clearTimeout(panelSyncTimer); clearTimeout(accountSyncTimer);
      await syncAccountState();
      await syncPanelData();
      const endpoint = (await getDevicePushSubscription())?.endpoint || '';
      await disablePushNotifications();
      const response = await authenticatedFetch('/api/auth/logout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'ØªØ¹Ø°Ø± ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬Ø› Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.');
      currentAccount = null; devicePushEnabled = false; devicePushStateKnown = true;
      state = loadState(`${STORAGE_KEY}.guest`); media = []; currentStep = 0; authMode = 'login';
      applyTheme(); showPage('auth'); renderAuth(); syncHeader(); showToast('ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬.');
    } catch (error) { showToast(error.message || 'ØªØ¹Ø°Ø± ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬Ø› Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.'); }
    finally { button.disabled = false; }
  });
  document.querySelectorAll('[data-google-signin]').forEach((button) => {
    button.addEventListener('click', () => { if (!googleSignInReady) showToast('ØªØ³Ø¬ÙŠÙ„ Google ÙŠØ­ØªØ§Ø¬ Ø¥Ø¶Ø§ÙØ© GOOGLE_CLIENT_ID Ø¥Ù„Ù‰ Ù…Ù„Ù .env.'); });
    button.addEventListener('keydown', (event) => { if (!googleSignInReady && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); showToast('ØªØ³Ø¬ÙŠÙ„ Google ÙŠØ­ØªØ§Ø¬ Ø¥Ø¶Ø§ÙØ© GOOGLE_CLIENT_ID Ø¥Ù„Ù‰ Ù…Ù„Ù .env.'); } });
  });
  el('start-setup').addEventListener('click', () => openWizard(0)); el('edit-data').addEventListener('click', () => openWizard(0)); el('system-edit').addEventListener('click', () => openWizard(0));
  el('step-next').addEventListener('click', nextStep); el('step-back').addEventListener('click', previousStep); el('start-setup').addEventListener('keydown', (event) => { if (event.key === 'Enter') openWizard(0); });
  el('refresh-weather').addEventListener('click', loadWeather); el('history-new').addEventListener('click', () => openWizard(0));
  el('update-monthly-loss').addEventListener('click', updateMonthlyAssessment);
  el('analyze-panels').addEventListener('click', () => runAnalysis({ useClaude: true }));
  el('dashboard-bill-month').addEventListener('change', () => {
    const month = el('dashboard-bill-month').value;
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return;
    if (month !== state.form.billMonth) { state.form.expectedMonthlyKwh = ''; state.form.actualMonthlyKwh = ''; }
    state.form.billMonth = month; state.monthlyLoss = null; invoiceReview = null; persist(); renderAnalysisDetails(); applyLanguage();
  });
  el('cleaned-button').addEventListener('click', async () => {
    if (!currentAccount?.id) { showToast('Ø³Ø¬Ù‘Ù„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø£ÙˆÙ„Ø§Ù‹.'); return; }
    const button = el('cleaned-button'); button.disabled = true;
    const accountId = currentAccount.id;
    try {
      const response = await authenticatedFetch('/api/panel/cleaned', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const data = await response.json();
      if (!response.ok || !Number.isFinite(Date.parse(data.lastCleanedAt || ''))) throw new Error(data.error || 'ØªØ¹Ø°Ø± Ø­ÙØ¸ Ø³Ø¬Ù„ Ø§Ù„ØªÙ†Ø¸ÙŠÙ Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø§Ø¯Ù….');
      if (accountId !== currentAccount?.id) return;
      state.lastCleanedAt = data.lastCleanedAt;
      state.form.dust = null; state.form.dustManual = false;
      // Cleaning starts a new condition; an old visual assessment is not a fresh inspection.
      state.ai = null; state.aiModel = null; state.aiLanguage = null;
      const previousReport = state.result || {};
      state.result = calculateLoss();
      state.result.reportId = null;
      if (previousReport.monthlyProductionKwh !== undefined) {
        const monthlyProduction = Number(previousReport.monthlyProductionKwh || state.result.possibleKwh * 30);
        state.result.monthlyProductionKwh = monthlyProduction;
        state.result.heatLossPercent = state.result.heatPercent;
        state.result.heatLossOmr = state.result.heatPercent === null ? null : monthlyProduction * (state.result.heatPercent / 100) * state.result.tariffOmrPerKwh;
        state.result.dustLossPercent = state.result.soilingPercent;
        state.result.dustLossOmr = null;
      }
      state.updatedAt = new Date().toISOString(); persist(); renderDashboard(); showToast(ui('ØªÙ… ØªØ³Ø¬ÙŠÙ„ ØªÙ†Ø¸ÙŠÙ Ø§Ù„Ø£Ù„ÙˆØ§Ø­.', 'Panel cleaning was recorded.'));
    } catch (error) { showToast(error.message || 'ØªØ¹Ø°Ø± Ø­ÙØ¸ Ø³Ø¬Ù„ Ø§Ù„ØªÙ†Ø¸ÙŠÙ Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø§Ø¯Ù….'); }
    finally { button.disabled = false; }
  });
  el('maintenance-done')?.addEventListener('click', () => {
    state.form.lastMaintenanceAt = todayIsoDate();
    state.updatedAt = new Date().toISOString();
    persist();
    renderDashboard();
    showToast(ui('ØªÙ… ØªØ­Ø¯ÙŠØ« ØªØ§Ø±ÙŠØ® Ø¢Ø®Ø± ØµÙŠØ§Ù†Ø© Ø¥Ù„Ù‰ Ø§Ù„ÙŠÙˆÙ….', 'Last maintenance date updated to today.'));
  });
  setInterval(() => { if (document.visibilityState !== 'hidden') renderMaintenance(); }, 60 * 60 * 1000);
  el('setting-dark').addEventListener('change', () => { state.settings.dark = el('setting-dark').checked; persist(); });
  el('setting-sound').addEventListener('change', () => { state.settings.sound = el('setting-sound').checked; persist(); });
  el('setting-language').addEventListener('change', () => { state.settings.language = el('setting-language').value === 'en' ? 'en' : 'ar'; persist(); renderDashboard(); renderCurrentStep(); renderHistory(); renderSettings(); renderAuth(); renderGoogleButtons(); });
  el('setting-notifications').addEventListener('change', async () => {
    const enable = el('setting-notifications').checked;
    devicePushBusy = true; el('setting-notifications').disabled = true;
    try {
      if (enable) { await enablePushNotifications(); state.settings.notifications = true; persist(); }
      else await disablePushNotifications();
      showToast(enable ? 'ØªÙ… ØªÙØ¹ÙŠÙ„ Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª.' : 'ØªÙ… Ø¥ÙŠÙ‚Ø§Ù Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª.');
    } catch (error) {
      await refreshDevicePushState().catch(() => { devicePushStateKnown = false; });
      showToast(error.message || (enable ? 'ØªØ¹Ø°Ø± ØªÙØ¹ÙŠÙ„ Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§ØªØ› ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø¥Ø°Ù† ÙˆØ§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø®Ø§Ø¯Ù….' : 'ØªØ¹Ø°Ø± Ø¥ÙŠÙ‚Ø§Ù ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ù‡Ø°Ø§ Ø§Ù„Ø¬Ù‡Ø§Ø².'));
    } finally { devicePushBusy = false; renderSettings(); }
  });
  el('reset-data').addEventListener('click', async () => {
    if (!confirm('Ù‡Ù„ ØªØ±ÙŠØ¯ Ù…Ø³Ø­ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø¨ ÙˆÙ…Ø±ÙÙ‚Ø§ØªÙ‡ Ù…Ù† Ø¬Ù…ÙŠØ¹ Ø£Ø¬Ù‡Ø²ØªÙƒØŸ')) return;
    resetAiRequests();
    const user = state.user; const currentKey = accountStorageKey(); const accountId = currentAccount?.id;
    localStorage.removeItem(currentKey); state = structuredClone(DEFAULT_STATE); state.user = user; media = [];
    try { if (accountId) await deleteMediaForAccount(accountId); } catch { /* database may not be available */ }
    try { if (accountId) await authenticatedFetch('/api/panel/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }); } catch { /* local reset still completes */ }
    persist(); renderDashboard(); renderSettings(); showToast('ØªÙ… Ù…Ø³Ø­ Ø¨ÙŠØ§Ù†Ø§Øª Ø­Ø³Ø§Ø¨Ùƒ.');
  });
  el('export-data').addEventListener('click', () => {
    const payload = { savedAt: new Date().toISOString(), state, attachments: media.map(({ id, category, name, type }) => ({ id, category, name, type })) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = 'siyaj-data.json'; link.click(); URL.revokeObjectURL(url); showToast('ØªÙ… ØªÙ†Ø²ÙŠÙ„ Ù†Ø³Ø®Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª.');
  });
  el('complaint-submit')?.addEventListener('click', submitComplaint);
  el('complaint-share')?.addEventListener('click', shareComplaint);
  el('report-download')?.addEventListener('click', downloadReport);
  el('report-print')?.addEventListener('click', downloadReport);
  el('report-share')?.addEventListener('click', shareReport);
  el('toast')?.addEventListener('click', () => { clearTimeout(toastTimer); el('toast').classList.remove('show'); });
}
function init() {
  state.user = null;
  introActive = true; // keep the branding screens light until the intro finishes
  setupEvents(); applyTheme(); el('footer-year').textContent = new Date().getFullYear();
  window.addEventListener('pagehide', () => {
    if (!currentAccount) return;
    fetch('/api/account/state', {
      method: 'PUT', credentials: 'same-origin', keepalive: true,
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state: { ...state, user: null } }),
    }).catch(() => {});
  });
  el('app-shell').hidden = true; el('intro').hidden = false; applyLanguage(); renderAuth(); playIntro(); loadAppSettings();
  restoreExistingSession().catch(() => {}).finally(() => { bootstrapSettled = true; hideLoadingScreen(); });
}
async function restoreExistingSession() {
  try {
    const response = await authenticatedFetch('/api/auth/session');
    if (!response.ok) return;
    const session = await response.json();
    const seed = localStorage.getItem(accountStorageKey(session.user.id)) ? loadState(accountStorageKey(session.user.id)) : null;
    await finishServerAuth(session, seed);
    await continueAfterAuth();
  } catch { /* show sign-in if the server cannot restore the session */ }
}
init();
