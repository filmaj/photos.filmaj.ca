export default async function Preflight({ req }) {
  return {
    pageTitle: getPageTitle(req.path),
  };
}

function getPageTitle(path) {
  const titleMap = {
    '/': "Photos by Fil Maj",
  };

  return titleMap[path] || 'Photos by Fil Maj';
}
