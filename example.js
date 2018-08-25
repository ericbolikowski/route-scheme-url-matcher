//const url = "https://www.example.com/en/products/1/images/123"
const url = "https://www.expertlead.com/de/products"
//let scheme = "/:lang/products/:id/images[/:imageId]"
//let scheme = "/:lang/products/:id/images"
let scheme = "/:lang/products"

console.log( doMatch(url, scheme) )

function doMatch(url, scheme) {
  // Get routing schema and URL. Write out {} json string if they're not there
  if (!scheme || !url) return {};
  
  // Declare regular expressions for use in function
  const basePattern = "^(http|https)://([\\w\.]+)" // regex string for base of url
  const schemeHostPathMatcher = new RegExp("^(http|https)://([\\w\.]+)(.+)") // regex to extract scheme, host and path from url
  const schemeSplitter = /^([^\[]+)\[?([^\]]+)?/ // regex to split scheme into normal part and optional part (enclosed between [ and ])
  const paramMatcher = /(:\w+)/gi // regex to match a scheme parameter (of style ":paramName")
  
  // Split the scheme into normal part and optional part
  const split = schemeSplitter.exec(scheme);
  let normal = split[1]
  let optional = split[2]
  
  // Array to track every parameter name (e.g. lang, id, imageId) we come across when parsing normal and optional parts above
  const paramNames = []
  
  // Extract parameter names in normal part. Replace each param with a regex group to later extract param value from url
  const normalMatches = normal.match(paramMatcher)
  normalMatches && normalMatches.forEach(param => {
    paramNames.push(param.substring(1))
    normal = normal.replace(param, `(\\w+)+`)
  })
  // Extract parameter names in optional part. Replace each param with a regex group as above
  if (optional) {
    optional = optional.replace(/\//g, "/*")
    const optionalMatches = optional.match(paramMatcher)
    optionalMatches && optionalMatches.forEach(param => {
      paramNames.push(param.substring(1))
      optional = optional.replace(param, `(\\w+)*`)
    })
  }
  
  // Match scheme, host and path. Write out {} json string if no match
  const schemeHostPath = schemeHostPathMatcher.exec(url)
  if (!schemeHostPath) return {}
  
  // Put together one big RegExp to extract all parameters from the URL
  const parametersMatcher = new RegExp(basePattern + normal + (optional ? optional : ''))
  const params = parametersMatcher.exec(url)
  const parameters = {}
  
  // All matched parameters are in the indexed array params. Match them with parameter names in
  // the array paramNames. Put them together in a parameters object
  paramNames.forEach((paramName, i) => {
    parameters[paramName] = params[i + 3];
  })
  
  // Write out all parse results
  const results = {
    scheme: schemeHostPath[1],
    host: schemeHostPath[2],
    path: schemeHostPath[3],
    parameters
  }
  
  return results
}

