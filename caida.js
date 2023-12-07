function resize() {
  document.querySelector("#content").viewBox.baseVal.x = -(window.innerWidth / 2);
  document.querySelector("#content").viewBox.baseVal.y = -(window.innerHeight / 2);
  document.querySelector("#content").viewBox.baseVal.width = window.innerWidth;
  document.querySelector("#content").viewBox.baseVal.height = window.innerHeight;
  document.querySelector("#content").style.height = window.innerHeight + "px";
  document.querySelector("#content").style.width = window.innerWidth + "px";
  document.querySelector(".content").style.height = window.innerHeight + "px";
  document.querySelector(".content").style.width = window.innerWidth + "px";
  document.querySelector("#suelo").y.baseVal.value = ((window.innerHeight / 2) - window.innerHeight * 0.05);
}

var dibujar = function (datos) {
  var _self = this;
  _self.datos = datos;
  google.charts.load('current', { 'packages': ['corechart'] });
  google.charts.setOnLoadCallback(drawCharts);

  function drawCharts() {
    // gráfico de velocidad (v)
    var arrayV = [['t', 'v']];
    var fracciones = _self.datos.t / 5;
    for (var i = 0; i <= 5; i++) {
      arrayV.push([fracciones * i, caida({ t: fracciones * i }).vf()]);
    }
    var dataV = google.visualization.arrayToDataTable(arrayV);
    var optionsV = {
      title: 'Aceleración vs Tiempo',
      hAxis: { title: 't', titleTextStyle: { color: '#333' } },
      vAxis: { title: 'metros/segundo', minValue: 0 }
    };
    var chartV = new google.visualization.AreaChart(document.getElementById('chart_div_v'));
    chartV.draw(dataV, optionsV);

    // gráfico de distancia 
    var arrayY = [['t', 'y']];
    for (var i = 0; i <= 5; i++) {
      arrayY.push([fracciones * i, caida({ t: fracciones * i }).d()]);
    }
    var dataY = google.visualization.arrayToDataTable(arrayY);
    var optionsY = {
      title: 'Distancia vs Tiempo',
      hAxis: { title: 't', titleTextStyle: { color: '#333' } },
      vAxis: { title: 'metros', minValue: 0 }
    };
    var chartY = new google.visualization.AreaChart(document.getElementById('chart_div_y'));
    chartY.draw(dataY, optionsY);

    var vfRounded = parseFloat(_self.datos.vf.toFixed(2));
    var tiempoRounded = parseFloat(_self.datos.t.toFixed(2));

    $("#vf").html(vfRounded);
    $("#tiempo").val(tiempoRounded);
  }
};

var animar = function (datos) {
  var _self = this;
  _self.datos = datos;
  _self.datos.t_actual = 0;

  function init() {
    $("#vf").html(_self.datos.vf);
    // Convertir el valor del radio a un número y calcular la nueva posición 'cy'
    var radio = parseFloat($("#cuerpo").attr("r"));
    var nuevaCy = parseFloat($("#suelo").attr("y")) - radio;
    $("#cuerpo").velocity({ cy: nuevaCy, cx: $("#cuerpo").attr("cx") }, (_self.datos.t * 1000));
  }

  init();
  return _self;
}

var caida = function (datos) {
  var _self = this;
  _self.datos = datos;

  function init() {
    _self.datos.v = parseFloat($("#vo").text()) || 0;
    _self.datos.masa = $("#enVacio").prop("checked") ? 1 : parseFloat($("#masaObjeto").val()) || masaObjeto;
    // Nuevos parámetros para resistencia del aire
    _self.datos.densidadAire = $("#enVacio").prop("checked") ? 0.1 : parseFloat($("#densidadAire").val()) || 1.2;
    _self.datos.areaSuperficial = $("#enVacio").prop("checked") ? 0.01 : parseFloat($("#areaSuperficial").val()) || 1;
    _self.datos.coefArrastre = $("#enVacio").prop("checked") ? 0 : parseFloat($("#coefArrastre").val()) || 0.47;

    // Calcular la resistencia del aire
    _self.datos.fuerzaArrastre = 0.5 * _self.datos.densidadAire * Math.pow(_self.datos.v, 2) * _self.datos.coefArrastre * _self.datos.areaSuperficial;

    // Calcular aceleración neta considerando resistencia del aire y masa
    _self.datos.a = (9.81 * _self.datos.masa - _self.datos.fuerzaArrastre) / _self.datos.masa;

    if (!_self.datos.d) {
      _self.datos.d = _self.d();
    }
    if (!_self.datos.t) {
      _self.datos.t = _self.t();
    }
    if (!_self.datos.vf) {
      _self.datos.vf = _self.vf();
    }
    animar(_self.datos);
  }

  _self.vf = function () {
    return (_self.datos.v + _self.datos.a * _self.datos.t);
  }

  _self.d = function () {
    return (_self.datos.v * _self.datos.t + 0.5 * _self.datos.a * Math.pow(_self.datos.t, 2));
  }

  _self.t = function () {
    // Valores iniciales
    var v = _self.datos.v; // Velocidad inicial
    var t = 0; // Tiempo inicial
    var dt = 0.01; // Incremento de tiempo para la simulación
    var g = 9.81; // Aceleración de la gravedad
    var y = _self.datos.d; // Altura inicial
  
    // Bucle para simular la caída
    while (y >= 0) {
      // Calcular la fuerza de arrastre en el instante actual
      var fuerzaArrastre = 0.5 * _self.datos.densidadAire * v * v * _self.datos.coefArrastre * _self.datos.areaSuperficial;
      // Calcular la aceleración neta
      var a = g - (fuerzaArrastre / _self.datos.masa);
      // Actualizar la velocidad y la posición
      v += a * dt;
      y -= v * dt;
      // Incrementar el tiempo
      t += dt;
    }
  
    return t; // Retorna el tiempo total de caída
  }  

  init();
  return _self;
}

$("#iniciar").click(function () {
  // Verificar si se ha proporcionado masa y altura
  if ($("#distancia").val() === "" && $("#tiempo").val() === "") {
    alert("Por favor, introduzca la altura o el tiempo");
    return;
  }

  if ($("#tiempo").val() && $("#distancia").val()) {
    alert("Ingrese solo uno de los valores");
    return 0;
  }

  if ($("#distancia").val()) {
    var datos = caida({ d: $("#distancia").val() });
    $("#tiempo").val(parseFloat(datos.datos.t.toFixed(2)));
    setTimeout(function () {
      dibujar(datos.datos);
    }, (datos.datos.t * 1000));
    return;
  }

  if ($("#tiempo").val()) {
    var datos = caida({ t: $("#tiempo").val() });
    $("#distancia").val(parseFloat(datos.datos.d.toFixed(2)));
    setTimeout(function () {
      dibujar(datos.datos);
    }, (datos.datos.t * 1000));
    dibujar(datos.datos);
  }
  
  // Verificar si el checkbox "en vacío" está marcado y deshabilitar la entrada de masa, densidadAire, areaSuperficial y coefArrastre
  if ($("#enVacio").prop("checked")) {
    $("#masaObjeto, #densidadAire, #areaSuperficial, #coefArrastre").prop("disabled", true);
    $("#masaObjeto").val(1);  // Establecer masa en 1 cuando está en vacío
    $("#densidadAire").val(0.1);  // Establecer densidad del aire en 0.1 cuando está en vacío
    $("#areaSuperficial").val(0.01);  // Establecer área superficial en 0.01 cuando está en vacío
    $("#coefArrastre").val(0);  // Establecer coeficiente de arrastre en 0 cuando está en vacío
  } else {
    $("#masaObjeto, #densidadAire, #areaSuperficial, #coefArrastre").prop("disabled", false);
  }
});

// Agrega un evento para cambiar la entrada de masa, densidadAire, areaSuperficial y coefArrastre cuando se marque/desmarque el checkbox
$("#enVacio").change(function () {
  if ($(this).prop("checked")) {
    $("#masaObjeto, #densidadAire, #areaSuperficial, #coefArrastre").prop("disabled", true);
    $("#masaObjeto").val(1);  // Establecer masa en 1 cuando está en vacío
    $("#densidadAire").val(0.1);  // Establecer densidad del aire en 0.1 cuando está en vacío
    $("#areaSuperficial").val(0.01);  // Establecer área superficial en 0.01 cuando está en vacío
    $("#coefArrastre").val(0);  // Establecer coeficiente de arrastre en 0 cuando está en vacío
  } else {
    $("#masaObjeto, #densidadAire, #areaSuperficial, #coefArrastre").prop("disabled", false);
  }
});

$("#distancia").on("input", function (e) {
  $("#tiempo")[0].disabled = true;
  $("#tiempo").val("");
  if (!$("#distancia").val()) {
    $("#tiempo")[0].disabled = false;
  }
});

$("#tiempo").on("input", function (e) {
  $("#distancia")[0].disabled = true;
  $("#distancia").val("");
  if (!$("#tiempo").val()) {
    $("#distancia")[0].disabled = false;
  }
});

$("#altura").on("input", function () {
  $("#distancia").val($("#altura").val());
  $("#distancia").trigger("input", $("#altura").val());
  $("#distancia")[0].disabled = false;
});

$("#reiniciar").click(function () {
  location.reload(); // Recargar la página
});

$(document).ready(function () {
  $("#myModal").css("display", "block");

  // Agregar funcionalidad para cerrar el cuadro modal
  $(".close").click(function () {
    $("#myModal").css("display", "none");
  });

  // Cerrar el cuadro modal si se hace clic fuera de él
  window.onclick = function (event) {
    if (event.target === $("#myModal")[0]) {
      $("#myModal").css("display", "none");
    }
  };
});

window.onresize = resize;
resize();
