import { getData } from 'example-service'

async function main() {
  function renderRPC(data: any) {
    const pre = document.createElement('pre')
    pre.innerText = JSON.stringify(data, null, 2)
    document.getElementById('container')?.appendChild(pre)
  }

  const fromRPC = getData({
    uid: '91875134123123',
  })

  fromRPC.then((data) => {
    renderRPC(data)
  })
}
main()
