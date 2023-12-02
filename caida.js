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

dibujar = function (datos) {
  var _self = this;
  _self.datos = datos;
  google.charts.load('current', { 'packages': ['corechart'] });
  google.charts.setOnLoadCallback(drawCharts);

  function drawCharts() {
    // Crear datos para el gráfico de velocidad (v)
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

    // Crear datos para el gráfico de distancia (y)
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

    // Redondear la velocidad final y el tiempo a 2 decimales
    var vfRounded = parseFloat(_self.datos.vf.toFixed(2));
    var tiempoRounded = parseFloat(_self.datos.t.toFixed(2));

    // Mostrar la velocidad final y el tiempo redondeados en el HTML
    $("#vf").html(vfRounded);
    $("#tiempo").val(tiempoRounded);
  }
};

animar = function (datos) {
  var _self = this;
  _self.datos = datos;
  _self.datos.t_actual = 0;

  function init() {
    $("#vf").html(_self.datos.vf);
    $("#cuerpo").velocity({ cy: ($("#suelo").attr("y") - $("#cuerpo").attr("r")), cx: $("#cuerpo").attr("cx") }, (_self.datos.t * 1000));
  }

  init();
  return _self;
}

caida = function (datos) {
  var _self = this;
  _self.datos = datos;
  function init() {
    _self.datos.a = 9.81;
    _self.datos.vo = 0;
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
    return (9.81 * (_self.datos.t));
  }
  _self.d = function () {
    return ((0.5 * (9.81) * (_self.datos.t * _self.datos.t)));
  }
  _self.t = function () {
    return (Math.sqrt((2 * _self.datos.d) / 9.81));
  }
  init();
  return _self;
}

$("#iniciar").click(function () {
  // Verificar si se han proporcionado resistencia del aire, masa y altura
  if ($("#resistenciaAire").val() === "" || $("#masaObjeto").val() === "" || $("#altura").val() === "") {
    alert("Por favor, introduzca los valores de resistencia del aire, masa y altura.");
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