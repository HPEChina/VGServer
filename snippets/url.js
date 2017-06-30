// http://localhost:3000/editor.html?a=1#c
//    {
//       hash: "#c",
//       host: "localhost:3000",
//       hostname: "localhost",
//       href: "http://localhost:3000/editor.html?a=1#c",
//       origin: "http://localhost:3000",
//       pathname: "/editor.html",
//       port: "3000",
//       protocol: "http:",
//       search: "?a=1"
//    }

console.log(location.hostname)
console.log(location.host)
console.log(location.origin)
console.log(location.href)// 原始请求的文档的URL
console.log(document.URL)// 重定向后URL
console.log(document.domain)// 默认等于location.hostname,iframe中用于解决跨域问题
