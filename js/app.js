// Variables y Selectores
const formularioPresupuesto = document.querySelector("#ingresar-presupuesto");
const formularioGasto = document.querySelector("#agregar-gasto");
const btnGuardarPresupuesto = document.querySelector("#guardar-presupuesto");
const btnAgregarMasPresupuesto = document.querySelector(
  "#agregar-mas-presupuesto"
);
const tablaGastos = document.querySelector("#gastos tbody");

// Eventos
eventListeners();
function eventListeners() {
  document.addEventListener("DOMContentLoaded", cargarPresupuesto);
  formularioPresupuesto.addEventListener("submit", ingresarPresupuesto);
  formularioGasto.addEventListener("submit", agregarGasto);
  btnAgregarMasPresupuesto.addEventListener(
    "click",
    mostrarFormularioPresupuesto
  );
  tablaGastos.addEventListener("click", eliminarGasto);
}

// Clases
class Presupuesto {
  constructor(presupuesto) {
    this.presupuesto = Number(presupuesto);
    this.restante = Number(presupuesto);
    this.gastos = [];
  }

  nuevoGasto(gasto) {
    this.gastos = [...this.gastos, gasto];
    this.calcularRestante();
    this.guardarEnLocalStorage();
  }

  calcularRestante() {
    const gastado = this.gastos.reduce(
      (total, gasto) => total + gasto.cantidad,
      0
    );
    this.restante = this.presupuesto - gastado;
  }

  eliminarGasto(id) {
    this.gastos = this.gastos.filter((gasto) => gasto.id !== id);
    this.calcularRestante();
    this.guardarEnLocalStorage();
  }

  guardarEnLocalStorage() {
    localStorage.setItem("presupuesto", JSON.stringify(this));
  }

  static cargarDeLocalStorage() {
    const presupuestoLS = localStorage.getItem("presupuesto");
    if (presupuestoLS) {
      const data = JSON.parse(presupuestoLS);
      const presupuesto = new Presupuesto(data.presupuesto);
      presupuesto.restante = data.restante;
      presupuesto.gastos = data.gastos;
      return presupuesto;
    }
    return null;
  }
}

class UI {
  insertarPresupuesto(cantidad) {
    const { presupuesto, restante } = cantidad;
    document.querySelector("#total").textContent = presupuesto;
    document.querySelector("#restante").textContent = restante;
  }

  imprimirAlerta(mensaje, tipo) {
    const divMensaje = document.createElement("div");
    divMensaje.classList.add("text-center", "alert");

    if (tipo === "error") {
      divMensaje.classList.add("alert-danger");
    } else {
      divMensaje.classList.add("alert-success");
    }

    divMensaje.textContent = mensaje;
    document
      .querySelector(".primario")
      .insertBefore(divMensaje, formularioGasto);
    setTimeout(() => {
      divMensaje.remove();
    }, 3000);
  }

  mostrarGastos(gastos) {
    tablaGastos.innerHTML = "";

    gastos.forEach((gasto) => {
      const { cantidad, nombre, fecha, id } = gasto;
      const nuevoGasto = document.createElement("tr");
      nuevoGasto.innerHTML = `
        <td>${nombre}</td>
        <td>$ ${cantidad}</td>
        <td>${fecha}</td>
        <td><button class="btn btn-danger borrar-gasto" data-id="${id}">Borrar</button></td>
      `;
      tablaGastos.appendChild(nuevoGasto);
    });
  }

  actualizarRestante(restante) {
    document.querySelector("#restante").textContent = restante;
  }

  comprobarPresupuesto(presupuestoObj) {
    const { presupuesto, restante } = presupuestoObj;
    const restanteDiv = document.querySelector(".restante");

    if (presupuesto / 4 > restante) {
      restanteDiv.classList.remove("alert-success", "alert-warning");
      restanteDiv.classList.add("alert-danger");
    } else if (presupuesto / 2 > restante) {
      restanteDiv.classList.remove("alert-success");
      restanteDiv.classList.add("alert-warning");
    } else {
      restanteDiv.classList.remove("alert-danger", "alert-warning");
      restanteDiv.classList.add("alert-success");
    }
    if (restante <= 0) {
      ui.imprimirAlerta("El presupuesto se ha agotado", "error");
      formularioGasto.querySelector('button[type="submit"]').disabled = true;
    }
  }
}

const ui = new UI();
let presupuesto = null;

function cargarPresupuesto() {
  const presupuestoGuardado = Presupuesto.cargarDeLocalStorage();
  if (presupuestoGuardado !== null) {
    presupuesto = presupuestoGuardado;
    ui.insertarPresupuesto(presupuesto);
    ui.mostrarGastos(presupuesto.gastos);
    mostrarFormularioPresupuesto();
  }
}

function ingresarPresupuesto(e) {
  e.preventDefault();
  const presupuestoInicial = parseInt(
    document.querySelector("#presupuesto").value
  );

  if (presupuestoInicial <= 0 || isNaN(presupuestoInicial)) {
    ui.imprimirAlerta("El presupuesto no es válido", "error");
    return;
  }

  presupuesto = new Presupuesto(presupuestoInicial);
  ui.insertarPresupuesto(presupuesto);
  mostrarFormularioPresupuesto();
}

function agregarGasto(e) {
  e.preventDefault();

  const nombre = document.querySelector("#gasto").value;
  const cantidad = parseInt(document.querySelector("#cantidad").value);
  const fecha = document.querySelector("#fecha").value;

  if (nombre === "" || cantidad <= 0 || isNaN(cantidad) || fecha === "") {
    ui.imprimirAlerta(
      "Todos los campos son obligatorios y la cantidad debe ser válida",
      "error"
    );
    return;
  }

  if (cantidad > presupuesto.restante) {
    ui.imprimirAlerta(
      "La cantidad del gasto supera el presupuesto restante",
      "error"
    );
    return;
  }

  const gasto = { nombre, cantidad, fecha, id: Date.now() };

  presupuesto.nuevoGasto(gasto);

  ui.imprimirAlerta("Gasto agregado correctamente!!");
  ui.mostrarGastos(presupuesto.gastos);
  ui.actualizarRestante(presupuesto.restante);
  ui.comprobarPresupuesto(presupuesto);

  formularioGasto.reset();
}

function eliminarGasto(e) {
  if (e.target.classList.contains("borrar-gasto")) {
    const id = parseInt(e.target.dataset.id);
    presupuesto.eliminarGasto(id);
    ui.mostrarGastos(presupuesto.gastos);
    ui.actualizarRestante(presupuesto.restante);
    ui.comprobarPresupuesto(presupuesto);
  }
}

function mostrarFormularioPresupuesto() {
  btnGuardarPresupuesto.disabled = true;
  btnAgregarMasPresupuesto.classList.remove("d-none");
  btnAgregarMasPresupuesto.addEventListener("click", () => {
    const presupuestoAdicional = parseInt(
      prompt("Ingrese el monto a añadir al presupuesto actual")
    );
    if (!isNaN(presupuestoAdicional) && presupuestoAdicional > 0) {
      presupuesto.presupuesto += presupuestoAdicional;
      presupuesto.restante += presupuestoAdicional;
      ui.insertarPresupuesto(presupuesto);
      presupuesto.guardarEnLocalStorage();
    } else {
      ui.imprimirAlerta(
        "Por favor, ingrese un monto válido para añadir al presupuesto",
        "error"
      );
    }
  });
}
