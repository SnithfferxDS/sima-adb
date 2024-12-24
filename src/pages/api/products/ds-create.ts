$(".boton_submit").click(function (event) {
    event.preventDefault();
    if ($(".id_tipo_producto option:selected").val() != 0) {
        if ($(".cesc").is(":checked")) {
            var cesc = "true";
        } else {
            var cesc = "false";
        }

        if ($(".seminuevo").is(":checked")) {
            var seminuevo = "true";
        } else {
            var seminuevo = "false";
        }

        var upc = $(".upc").val();
        var modelo = $(".modelo").val();
        var enlace = $(".enlace").val();
        var id_tipo_producto = $(".id_tipo_producto option:selected").val();
        var imagen = $(".imagen").val();
        var nombre = $(".nombre").val();
        var id_ubicacion = $(".id_ubicacion").val();
        var descripcion = $(".descripcion").val();
        var descripcion_corta = $(".descripcion_corta").val();
        var stock_minimo = $(".stock_minimo").val();
        var stock_maximo = $(".stock_maximo").val();
        var fecha_intro = $(".fecha_intro").val();
        var garantia_por_defecto = $(".garantia_por_defecto").val();
        var peso_producto = $(".peso_producto").val();
        var marca = $("#id_marca option:selected").val();
        var validacion = $("#validacion").val();
        var pais_origen = $("#id_pais_origen").val();
        var numero_parte = $("#numero_parte").val();

        if (validacion == "true") {
            alert("El UPC está repetido favor verificar para crear")
        } else {
            $.post("api/procesar_nuevo_producto.php", { upc: upc, enlace: enlace, modelo: modelo, id_tipo_producto: id_tipo_producto, imagen: imagen, nombre: nombre, id_ubicacion: id_ubicacion, descripcion: descripcion, stock_minimo: stock_minimo, stock_maximo: stock_maximo, fecha_intro: fecha_intro, garantia_por_defecto: garantia_por_defecto, peso_producto: peso_producto, cesc: cesc, descripcion_corta: descripcion_corta, seminuevo: seminuevo, marca: marca, pais_origen: pais_origen, numero_parte: numero_parte }, function (enviar) {
                $("#respuesta").html(enviar);
            });

            var tipo = document.getElementById("tipo_producto");
            var data_tipo = document.getElementById("tipo_producto").value;
            if (data_tipo == 55) {
                tipo.remove(tipo.selectedIndex);
            }
        }



    } else {
        alert("Olvidaste poner el tipo de Producto");
    }
});