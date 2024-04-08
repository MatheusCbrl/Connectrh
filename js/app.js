function invokeServiceWorkerUpdateFlow(registration) {
  // TODO implement your own UI notification element
  notification.show("Nova versão disponivel. Atualizar agora?");
  notification.addEventListener('click', () => {
      if (registration.waiting) {
          // let waiting Service Worker know it should became active
          registration.waiting.postMessage('SKIP_WAITING')
      }
  })
}

// check if the browser supports serviceWorker at all
if ('serviceWorker' in navigator) {
  // wait for the page to load
  window.addEventListener('load', async () => {
      // register the service worker from the file specified
      const registration = await navigator.serviceWorker.register('/serviceWorker.js')

      // ensure the case when the updatefound event was missed is also handled
      // by re-invoking the prompt when there's a waiting Service Worker
      if (registration.waiting) {
          invokeServiceWorkerUpdateFlow(registration)
      }

      // detect Service Worker update available and wait for it to become installed
      registration.addEventListener('updatefound', () => {
          if (registration.installing) {
              // wait until the new Service worker is actually installed (ready to take over)
              registration.installing.addEventListener('statechange', () => {
                  if (registration.waiting) {
                      // if there's an existing controller (previous Service Worker), show the prompt
                      if (navigator.serviceWorker.controller) {
                          invokeServiceWorkerUpdateFlow(registration)
                      } else {
                          // otherwise it's the first install, nothing to do
                          console.log('Service Worker initialized for the first time')
                      }
                  }
              })
          }
      })

      let refreshing = false;

      // detect controller change and refresh the page
      navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
              window.location.reload()
              refreshing = true
          }
      })
  })
}

window.addEventListener("load", start);
var isNew = true; //flag para identificar se é novo registro ou atualização

function start() {
  var buttonCalcular = document.querySelector("#calcular");
  buttonCalcular.addEventListener("click", calcularDescontos);
  var inputSalario = document.querySelector("#salario-bruto");
  inputSalario.focus();

    //var element = document.body;
  //element.classList.toggle("dark");
}

function calcularDescontos(event) {
  var salarioBruto = document.querySelector("#salario-bruto").value;
  var qtdDependentes = document.querySelector("#numero-dependente").value;
  var desc = document.querySelector("#outros-descontos").value;

  if (desc === "") {
    desc = 0;
  }

  if (!isNew) {
    var rowSalarioBruto = document.querySelector("#rowSalarioBruto");
    rowSalarioBruto.remove();
    var rowSalarioINSS = document.querySelector("#rowSalarioINSS");
    rowSalarioINSS.remove();
    var rowSalarioIR = document.querySelector("#rowSalarioIR");
    rowSalarioIR.remove();
    var rowSalarioTotal = document.querySelector("#rowSalarioTotal");
    rowSalarioTotal.remove();
    var rowSalarioResul = document.querySelector("#rowSalarioResul");
    rowSalarioResul.remove();
    var rowOutrosDescontos = document.querySelector("#rowOutrosDescontos");
    rowOutrosDescontos.remove();
  }

  var salarioDescInss = descontoInss(salarioBruto, desc);
  var salarioDescIr = descontoIr(salarioDescInss.salario, qtdDependentes);

  console.log("descontos - " + JSON.stringify(salarioDescInss));

  var SalarioFinal =salarioBruto - (parseFloat(salarioDescInss.valorDescontado) + parseFloat(salarioDescIr.valorDescontado) + parseFloat(desc));
  render( parseFloat(salarioBruto), salarioDescInss, parseFloat(desc),  salarioDescIr,   SalarioFinal);
  isNew = false;

}
//cáculo de desconto de INSS e outros descontos informados
function descontoInss(salarioInss, descOutro) {
  // console.log('descOutro - ' + descOutro);
  var returnSalario;
  var desconto;

  if (salarioInss <= parseFloat(1320.0)) {
    returnSalario = salarioInss * (7.5 / 100);
    desconto = "7,5%";
    // console.log('desconto 7,5% - ' + returnSalario);
  } else if (
    salarioInss > parseFloat(1320.01) &&
    salarioInss <= parseFloat(2571.29)
  ) {
    returnSalario = salarioInss * (9 / 100) - parseFloat(19.80);
    desconto = "9%";
    // console.log('desconto 9% - ' + returnSalario);
  } else if (
    salarioInss > parseFloat(2571.30) &&
    salarioInss <= parseFloat(3856.94)
  ) {
    returnSalario = salarioInss * (12 / 100) - parseFloat(96.94);
    desconto = "12%";
    // console.log('desconto 12% - ' + returnSalario);
  } else if (
    salarioInss > parseFloat(3856.95) &&
    salarioInss <= parseFloat(7507.49)
  ) {
    returnSalario = salarioInss * (14 / 100) - parseFloat(174.08);
    desconto = "14%";
    // console.log('desconto 14% - ' + returnSalario);
  } else {
    returnSalario = parseFloat(876.97);
    desconto = "R$ 876,95";
    //console.log('desconto 14% - ' + returnSalario);
  }

  return {
    descricao: "INSS",
    valorDescontado: returnSalario,
    proventos: "",
    desconto: desconto,
    salario: salarioInss - returnSalario
  };
}
//calculo de desconto de imposto de renda e quantiadde de dependentes
function descontoIr(salarioIR, dependentes) {
  var descIR;
  var descontoIR;

  if (parseFloat(dependentes) > parseFloat(0)) {
    salarioIR = salarioIR - dependentes * parseFloat(189.59);
    // console.log('salarioINSS  DEP- ' + salarioINSS);
  }
  if (salarioIR > parseFloat(2112.01) && salarioIR <= parseFloat(2826.65)) {
    descIR = salarioIR * (7.5 / 100) - parseFloat(158.4);
    descontoIR = "7,5%";
  } else if (
    salarioIR > parseFloat(2826.65) &&
    salarioIR <= parseFloat(3751.05)
  ) {
    descIR = salarioIR * (15 / 100) - parseFloat(370.4);
    descontoIR = "15%";
  } else if (
    salarioIR > parseFloat(3751.05) &&
    salarioIR <= parseFloat(4664.68)
  ) {
    descIR = salarioIR * (22.5 / 100) - parseFloat(671.73);
    descontoIR = "22,5%";
  } else if (salarioIR > parseFloat(4664.68)) {
    descIR = salarioIR * (27.5 / 100) - parseFloat(884.96);
    descontoIR = "27,5%";
  } else {
    descIR = "isento";
    descontoIR = "insento";
  }

  if (descIR < parseFloat(0) || typeof descIR === "string") {
    return {
      descricao: "IRRF",
      valorDescontado: parseFloat(0.0),
      proventos: "",
      salario: "",
      desconto: "Isento"
    };
  } else {
    return {
      descricao: "IRRF",
      valorDescontado: parseFloat(descIR),
      proventos: "",
      salario: "",
      desconto: descontoIR
    };
  }
}

function render(salarioBruto, salarioInss, desc, salarioIR, SalarioFinal) {
  console.log("render");
  var table = document.querySelector("#table");
  table.classList.remove("hide-table");
  let saldoFinal = parseFloat(salarioBruto) - parseFloat(SalarioFinal);
  //saldoFinal = saldoFinal + parseFloat(desc);
  //let SalarioFinal = parseFloat(salarioBruto) - parseFloat(saldoFinal);

  console.log('Salario Final: ' + SalarioFinal);
  console.log('Descontos: ' + parseFloat(desc));
  console.log('Saldo Final (descontos totais): ' + saldoFinal);



  var tableBody = document.querySelector("#body-table");

  const infoTable = ` <tbody id="body-table">
    <tr id="rowSalarioBruto">
      <td class="negrito">Salário Bruto</td>
      <td></td>
      <td class="green">${salarioBruto.toLocaleString("pt-br", {
        style: "currency",
        currency: "BRL"
      })}</td>
      <td></td>
    </tr>
    <tr id="rowSalarioINSS">
      <td class="negrito">${salarioInss.descricao}</td>
      <td>${salarioInss.desconto}</td>
      <td></td>
      <td class="red">${salarioInss.valorDescontado.toLocaleString("pt-br", {
        style: "currency",
        currency: "BRL"
      })}</td>
    </tr>
    <tr id="rowSalarioIR">
      <td class="negrito">${salarioIR.descricao}</td>
      <td>${salarioIR.desconto}</td>
      <td></td>
      <td class="red">${salarioIR.valorDescontado.toLocaleString("pt-br", {
        style: "currency",
        currency: "BRL"
      })}</td>
      </tr>
    <tr id="rowOutrosDescontos">
      <td class="negrito">Outros descontos</td>
      <td></td>
      <td></td>
      <td class="red">${desc.toLocaleString("pt-br", {
        style: "currency",
        currency: "BRL"
      })}</td>
    </tr>
    <tr id="rowSalarioTotal" class="gray">
      <td class="negrito">Total</td>
      <td></td>
      <td class="green">${salarioBruto.toLocaleString("pt-br", {
        style: "currency",
        currency: "BRL"
      })}</td>
      <td class="red">${saldoFinal.toLocaleString("pt-br", {
        style: "currency",
        currency: "BRL"
      })}</td>
    </tr>
    <tr id="rowSalarioResul" class="gray">
      <td class="negrito">Resultado</td>
      <td></td>
      <td></td>
      <td class="green">${SalarioFinal.toLocaleString("pt-br", {
        style: "currency",
        currency: "BRL"
      })}</td>
    </tr>
    </tbody>`;

  tableBody.innerHTML = infoTable;
}


function myFunction() {
  var element = document.body;
  element.classList.toggle("dark");
}
