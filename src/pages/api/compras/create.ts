$.ajax({
    url: 'api/procesar_nueva_entrada.php',
    data: {
        secuencia: secuencia2,
        id_usuario: $(".id_usuario").val(),
        fecha: $(".fecha").val(),
        fecha_factura: $(".fecha_factura").val(),
        factura: $(".factura").val(),
        upc: $(".upc").val(),
        nombre: $(".nombre").val(),
        id_proveedor: $(".id_proveedor").val(),
        costo_unitario: $(".costo_unitario").val(),
        cantidad: $(".cantidad").val(),
        costo_total: $(".costo_total").val(),
        id_plazo: $(".id_plazo option:selected").val(),
        series: $(".series").val(),
        id_documento: $(".id_documento").val(),
        retenido: $(".retencion").val(),
        mantener_costo: mantener_costo,
        duca: $(".duca").val(),
    },
    type: 'POST',
    success: function (precio_asignado) {

        $.ajax({
            url: 'async_store/_getPrecioConsumer.php',
            data: {
                opcion: "estado_valor_compras",
                upc: upc_p,
                cantidad: cantidad_p
            },
            type: 'POST',
            success: function (dat) {

            },
            error: function (xhr, status) {
                alert('Disculpe, existió un problema');
            },
            complete: function (xhr, status) {
                //alert('Petición actualizada');
            }
        });


        $("#respuesta").html(precio_asignado);
        $(".upc").focus();


    },
    error: function (xhr, status) {
        alert('Disculpe, existió un problema');
    },
    complete: function (xhr, status) {
        //alert('Petición actualizada');
    }
});