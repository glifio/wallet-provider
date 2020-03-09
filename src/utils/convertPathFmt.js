// use temporarily to get path to be an array from a string format
export default strPath =>
  strPath
    .slice(2)
    .split('/')
    .map(code =>
      code[code.length - 1] === "'" ? Number(code.slice(0, -1)) : Number(code),
    )
