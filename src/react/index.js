// Re-export React widget components from the example bundle for cleaner imports
// Note: These rely on a React/Next runtime; consumers should only import in web apps

let WidgetStandalone;
let WidgetEmbedded;
try {
  const mod = require('../../examples/web-widget/app/page');
  WidgetStandalone = mod.WidgetStandalone;
  WidgetEmbedded = mod.WidgetEmbedded;
} catch (e) {
  // noop – keep undefined when React files aren't resolvable
}

module.exports = {
  WidgetStandalone,
  WidgetEmbedded,
};


