/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {

  // Define template paths to load
  const templatePaths = [

    // Actor Sheet Partials
    "systems/scum-and-villainy/templates/parts/coins.html",
    "systems/scum-and-villainy/templates/parts/attributes.html",
    "systems/scum-and-villainy/templates/parts/coins-7.html",
    "systems/scum-and-villainy/templates/parts/attributes-7.html"
  ];

  // Load the template parts
  return loadTemplates(templatePaths);
};
