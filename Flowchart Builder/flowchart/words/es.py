"""Every word it says, in Spanish."""
from ..words.lookup import program, speaks

ES = {
    "start": "Inicio", "end": "Fin", "ret": "Retornar",
    "yes": "Verdadero", "no": "Falso", "again": "¿otra vez?",
    "key_oval": "Inicio / Fin", "key_rect": "Proceso",
    "key_io": "Entrada / Salida", "key_diamond": "Decisión",
    "key_hex": "Bucle", "key_sub": "Llamar a un módulo",
    "palette": "Paleta", "shapes": "Formas",
    # ---- the Style side: the words, the highlighter, the borders
    "t_head": "Texto", "t_face": "Tipo de letra",
    "t_sans": "Simple", "t_serif": "Libro",
    "t_mono": "Código", "t_hand": "A mano",
    "t_size": "Tamaño", "t_smaller": "Más pequeño",
    "t_bigger": "Más grande", "t_bold": "Negrita",
    "t_italic": "Cursiva", "t_under": "Subrayado",
    "t_strike": "Tachado", "t_color": "Color",
    "t_mark": "Resaltado", "t_mark_none": "Sin resaltado",
    "cp_sat": "Saturación", "cp_bright": "Brillo",
    "cp_recent": "Recientes", "cp_code": "Código de color",
    "t_mark_own": "Otro color", "m_yellow": "Amarillo",
    "m_green": "Verde", "m_pink": "Rosa",
    "m_blue": "Azul", "m_orange": "Naranja",
    "t_weight": "Grosor de línea", "t_thin": "Fina",
    "t_normal": "Normal", "t_thick": "Gruesa",
    "t_border": "Borde", "t_dashed": "Borde discontinuo",
    "t_copy_look": "Copiar estilo", "t_paste_look": "Pegar estilo",
    "t_size_list": "Elegir un tamaño",
    "selected": "Forma seleccionada", "rest": "Líneas y papel",
    "fill": "Relleno", "outline": "Contorno", "text": "Texto",
    "paper": "Papel", "grid": "Cuadrícula",
    "show_grid": "Mostrar la cuadrícula",
    "lines": "Líneas y flechas", "reset": "Restaurar todo el estilo",
    "download": "Descargar", "dl_size": "Tamaño",
    "files": "Archivos", "f_work_head": "Tu trabajo",
    "dl_svg": "Descargar SVG", "dl_png": "Descargar PNG", "panel": "Panel",
    "print_it": "Imprimir el diagrama",
    "print_head": "Imprimir",
    "print_go": "Imprimir…",
    "print_paper": "Papel",
    "print_wide": "Apaisado",
    "print_fit": "Ajustar a una página",
    "print_note": "Se imprime simple: sin colores, solo líneas y palabras. Qué impresora y cuántas copias lo pregunta tu navegador — una página no puede preguntarlo.",
    "panel_tip": "Mostrar u ocultar el panel",
    "png_tip": "Tamaño del PNG",
    "fit": "Ajustar", "actual": "Real", "zoom_in": "Acercar",
    "slide_left": "Izquierda", "slide_right": "Derecha", "slide_up": "Arriba", "slide_down": "Abajo",
    "hold_locked": "Fijo", "hold_loose": "Libre",
    "lock_tip": "Mantener el diagrama en su sitio, desplazándose dentro del área",
    "loose_tip": "Arrastra el diagrama a donde quieras; siempre queda una esquina a la vista",
    "tool_move": "Mover",
    "tool_move_tip": "Arrastra el papel para moverte por él. Mayús+arrastrar dibuja un recuadro para seleccionar formas.",
    "tool_select": "Seleccionar",
    "tool_select_tip": "Arrastra sobre el papel para seleccionar las formas que queden dentro. Toca o haz clic en formas para añadirlas o quitarlas.",
    "zoom_out": "Alejar", "pixels": "píxeles",
    "dl_scale": "Veces el tamaño dibujado",
    "dl_frame": "Ajustado dentro de una imagen",
    "png_over": "más de lo que este navegador puede dibujar",
    "click_shape": "Haz clic en una forma del diagrama para dar estilo solo a esa.",
    "palette_hint": "Una paleta cambia todas las formas a la vez. Lo que "
                    "cambies a mano después se conserva.",
    "shapes_hint": "Relleno y contorno, para todas las formas de ese tipo.",
    "apply_all": "Aplicar a las {n} formas: {what}", "clear": "Borrar",
    "rendering": "Generando…",
    "png_big": "El navegador no pudo crear un PNG tan grande. Prueba con "
               "un tamaño menor o guarda el SVG.",
    "png_fail": "El navegador no pudo dibujar el PNG. La descarga del SVG "
                "sigue funcionando.",
    "png_capped": "{want}× supera lo que admite el lienzo del "
                  "navegador, así que el PNG se guarda a {got}× "
                  "({w} × {h} píxeles).",
    "flowchart": "Diagrama de flujo",
    "r_head": "Ejecutar",
    "r_run": "Ejecutar",
    "r_stop": "Detener",
    "r_code": "Como código", "r_lang_pick": "En qué lenguaje está escrito el código",
    "r_pseudo": "Pseudocódigo",
    "r_slowly": "Paso a paso",
    "r_enter": "Entrar",
    "r_hint": "Ejecuta el programa del que salió el diagrama: pide lo que le pide a una persona, muestra lo que muestra y resalta la forma en la que está. Elige un lenguaje para ver el mismo programa escrito en él.",
    "r_started": "Ejecutando...",
    "r_done": "Terminado.",
    "r_nothing": "Todavía no hay nada que ejecutar.",
    "r_steps": "{n} pasos, {ms} ms.",
    "r_forever": "Lleva demasiado tiempo sin parar: en algún sitio hay un bucle del que nunca sale.",
    "r_zero": "Eso divide entre cero.",
    "r_unknown": "Todavía no se ha puesto nada en {name}.",
    "r_odd_op": "No sé qué hacer con {op}.",
    "r_half": "Esto no se lee como algo completo: {bit}",
    "r_back": "Volver a la ejecución", "back": "Atrás",
    "r_by_hand": "Ejecutar se ilumina solo en cuanto el diseño funciona. Comprobar el diseño muestra lo que aún falta.",
    "r_hand_ready": "Listo: el diseño funciona como programa. Pulsa Ejecutar para probarlo.",
    "h_runnable": "Listo: se lee como un programa, así que Ejecutar está encendido.",
    "h_no_start": "No hay ninguna forma por la que empezar.",
    "h_tangled": "Los bucles de este diseño se cruzan, así que no se puede escribir como un programa.",
    "h_not_a_program": "Las palabras de estas formas no se leen como un programa.",
    "r_build_first": "Construye un diagrama desde pseudocódigo y "
                     "podrá ejecutarse aquí.",
    "r_copy": "Copiar",
    "r_copied": "Copiado",
    "r_copy_no": "Cópialo a mano",
    "r_save_code": "Guardar",
    "r_file": "{name} salida",
    "r_pseudo_only": "Elige Python, Java, C# o JavaScript para ver el código.",
    # ---- dónde falló la ejecución, y qué tuvo que disimular la lectura
    "r_at": "Línea {line}",
    "r_show_line": "Muéstrame la línea de la que viene",
    "r_in_mod": "dentro de {name}, llamado desde la línea {line}",
    "r_in_mod_only": "dentro de {name}",
    "r_mean": "¿Querías decir {name}?",
    "r_unknown_fn": "No hay ningún módulo ni función que se llame {name}.",
    "r_odd_here": "No esperaba {bit} aquí.",
    "r_empty_expr": "Aquí no hay nada de lo que sacarlo.",
    "r_left_over": "Sobra {bit} al final de esto, sin nada a lo que unirse.",
    "r_open_quote": "Este texto no se cierra nunca: falta una comilla.",
    "r_open_bracket": "Este paréntesis se abre y no se cierra.",
    "r_shut_bracket": "Este paréntesis cierra uno que nunca se abrió.",
    "r_no_idea": "No consigo entender esta línea, así que la ejecución pasó de largo.",
    "r_stepped_over": "Se saltaron algunas líneas, así que lo impreso puede no ser todo.",
    "r_too_deep": "{name} se ha llamado a sí mismo demasiadas veces: en alguna parte no deja de llamarse.",
    "r_args": "{name} pide {want} y le han dado {got}.",
    "r_no_main": "Aquí no hay flujo principal, así que la ejecución empezó en {name}.",
    "w_head": "Merece un vistazo",
    "w_found": "{n} para mirar en el pseudocódigo:",
    "w_open_if": "Línea {line}: este If no se cierra nunca, así que todo lo de abajo queda dentro. Añade un End If donde deba terminar.",
    "w_open_loop": "Línea {line}: este bucle no se cierra nunca, así que todo lo de abajo da vueltas con él. Añade un End While donde deba terminar.",
    "w_open_for": "Línea {line}: este For nunca se cierra, así que todo lo que hay debajo da vueltas con él. Añade un End For donde deba terminar.",
    "w_open_select": "Línea {line}: este Select no se cierra nunca. Añade un End Select donde deba terminar.",
    "w_no_if": "Línea {line}: End If, pero no hay ningún If abierto que cerrar.",
    "w_no_loop": "Línea {line}: esto cierra un bucle, pero no hay ningún bucle abierto.",
    "w_no_select": "Línea {line}: End Select, pero no hay ningún Select abierto que cerrar.",
    "w_do_no_test": "Línea {line}: a este Do no se le da ninguna condición, así que daría vueltas para siempre. Termiñalo con Until ... o Loop While ...",
    "w_until_alone": "Línea {line}: Until, pero no hay ningún Do ni Repeat encima al que cerrar.",
    "w_mend_change": "Cambiar {word} por {instead}",
    "w_mend_drop": "Quitar la línea {line}",
    "w_mend_insert": "Poner {text} en la línea {line}",
    "w_mend_tip": "Doble clic para arreglarlo",
    "w_mend_close": "Poner el {text} que falta al final",
    "w_mend_all": "Arreglar los {n}",
    "n_rect": "Rectángulo",
    "an_arrow": "Flecha",
    "word_on_it": "Palabra en ella",
    "thickness": "Grosor",
    "color_of_it": "Color",
    "dashed": "Discontinua",
    "with_head": "Punta",
    "turn_it_round": "Invertir",
    "m_type": "Escribir dentro",
    "m_copy": "Duplicar",
    "c_fill": "Color de relleno", "c_line": "Color del borde", "c_words": "Color del texto",
    "c_clear": "Sin estilo propio",
    "m_turn": "Girar 90°",
    "m_solid": "Continua",
    "m_no_word": "Sin palabra",
    "m_fit": "Ajustar a la pantalla",
    "m_clip_copy": "Copiar",
    "m_clip_cut": "Cortar",
    "m_clip_paste": "Pegar",
    "m_all": "Seleccionar todo",
    "m_pin": "Mantener en estos lados",
    "m_unpin": "Dejar que busque sus lados",
    "sel_bar": "Qué hacer con lo seleccionado",
    "f_save": "Guardar en un archivo",
    "f_open": "Abrir un documento",
    "f_not_ours": "Es un archivo JSON, pero no un diseño guardado desde aquí.",
    "f_opened": "Se abrió {name}.",
    "f_empty": "Ese no tiene nada escrito.",
    "dl_copy": "Copiar el diagrama",
    "dl_copied": "Copiado",
    "dl_copy_no": "Este navegador no deja que una página ponga una imagen "
                  "en el portapapeles. Descárgala en su lugar.",
    "l_copy": "Copiar un enlace a esto",
    "l_copied": "Enlace copiado",
    "l_copy_no": "Este navegador no lo copió. Tómalo de la barra de "
                 "direcciones.",
    "fd_head": "Dónde se guarda",
    "fd_browser": "En las descargas de tu navegador.",
    "fd_in": "En la carpeta {name}.",
    "fd_pick": "Elegir una carpeta",
    "fd_pick_tip": "Elige una carpeta, o crea una nueva en la ventana que se "
                   "abre. Todo lo que guardes desde aquí irá directamente "
                   "a ella.",
    "fd_off": "Volver a las descargas",
    "fd_cannot": "Este navegador solo guarda en sus descargas. Chrome o Edge "
                 "en una computadora pueden guardar en la carpeta que elijas.",
    "fd_saved": "{name} guardado en {folder}",
    "fd_fell": "{folder} no lo aceptó, así que fue a tus descargas.",
    "l_opened": "Abierto desde un enlace.",
    "l_long": "Ese enlace tiene {n} caracteres. El correo y los chats cortan "
              "los enlaces largos, y un enlace cortado no abre nada: mejor "
              "envía el archivo.",
    "l_bad": "Ese enlace no lleva ningún diagrama que esta página pueda leer.",
    "sv_tab": "Progreso guardado",
    "sv_about": "Guarda el diagrama, la ejecución y el punto al que había "
                "llegado, aquí en este navegador. Hay sitio para {n}.",
    "sv_save": "Guardar el progreso",
    "sv_saved": "Guardado.",
    "sv_full": "Los {n} están ocupados. Guarda encima de uno, o borra uno "
               "para hacer sitio.",
    "sv_nothing": "Todavía no hay nada en la página que guardar.",
    "sv_no_room": "El navegador no quiso guardarlo: su almacenamiento está "
                  "lleno o desactivado.",
    "sv_empty": "Vacío",
    "sv_load": "Cargar",
    "sv_over": "Guardar encima",
    "sv_over_ask": "¿Poner lo que hay ahora en la página en lugar de este?",
    "sv_over_yes": "Guardar encima",
    "sv_del_ask": "¿Borrar este guardado para siempre?",
    "sv_today": "Hoy",
    "sv_st_none": "Sin ejecutar",
    "sv_st_ask": "Esperando una respuesta",
    "sv_st_next": "Esperando el siguiente paso",
    "sv_st_going": "A mitad de una ejecución",
    "sv_st_over": "Ejecución terminada",
    "sv_back": "Sigue donde lo dejaste.",
    "sv_moved": "Este guardado ya no encaja con el programa, así que no se "
                "pudo retomar la ejecución.",
    "sv_lost": "No se pudo leer el programa de este guardado desde el "
               "almacenamiento del navegador.",
    "sv_no_draw": "El diagrama no se dibujó, así que la ejecución no pudo "
                  "retomarse.",
    "sv_stop_said": "Cargar un guardado sustituye al programa que se está "
                    "ejecutando. La ejecución se detendrá.",
    "sv_stop_yes": "Detener y cargar",
    "held_head": "Lo que tiene guardado",
    "held_in": "en {name}",
    "held_shared": "Declarado fuera de todo módulo, así que lo ve cada diagrama",
    "held_none": "nada todavía",
    "held_switch": "Mostrar lo que tiene guardado",
    "h_tidy": "Ordenar",
    "h_tidy_tip": "Colocar cada figura donde esta página la dibujaría, "
                  "conservando las palabras, los colores y las flechas",
    "h_tidied": "Ordenado: {n} figuras movidas.",
    "h_tidy_none": "Todavía no hay nada que ordenar aquí.",
    "h_write": "Como pseudocódigo",
    "h_write_tip": "Escribir el dibujo como el pseudocódigo al que equivale",
    "h_into_box": "Ponerlo en el cuadro",
    "h_into_box_tip": "Escribir esto en el cuadro de pseudocódigo y "
                      "seguir ahí. El dibujo se queda donde está; lo que "
                      "hubiera en el cuadro se sobrescribe.",
    "s_no": "Déjalo",
    "s_stop_head": "Todavía se está ejecutando",
    "s_stop_said": "Dibujar un diagrama nuevo reemplaza el programa que se "
                   "está ejecutando. La ejecución se detendrá.",
    "s_stop_yes": "Detener y dibujar",
    "n_roundrect": "Caja redondeada",
    "n_offpage": "Fuera de página", "n_loop": "Límite de bucle", "n_parallel": "En paralelo",
    "n_text": "Texto", "n_actor": "Persona", "n_callout": "Bocadillo",
    "n_cube": "Cubo", "n_step": "Paso", "n_table": "Tabla",
    "n_stored": "Almacenado dentro", "n_cloud": "Nube",
    "n_card": "Tarjeta",
    "n_note": "Nota",
    "n_docs": "Páginas",
    "n_manual": "Entrada manual",
    "n_screen": "Pantalla",
    "n_arrow": "Flecha",
    "n_io_back": "Paralelogramo al revés",
    "n_oval": "Óvalo",
    "n_io": "Paralelogramo",
    "n_diamond": "Rombo",
    "n_hex": "Hexágono",
    "n_sub": "Caja con barras",
    "n_trap": "Trapecio",
    "n_doc": "Documento",
    "n_store": "Cilindro",
    "n_delay": "Espera",
    "n_circle": "Círculo",
    "shapes_for": "Forma de cada tipo",
    "shapes_for_hint": "Qué forma se dibuja para cada tipo de paso. Lo que significa el paso no cambia.",
    "size": "Tamaño",
    "width": "Ancho",
    "height": "Alto",
    "turn": "Girar",
    "fit_words": "Ajustar al texto",
    "colors_here": "Colores",
    "odd_shape": "No se puede dibujar {pair}; mira --help.",
    "mode_code": "Desde pseudocódigo",
    "mode_hand": "A mano",
    "add_shape": "Añadir una forma",
    "hand_hint": "Arrastra las formas. Haz clic en una, luego en Conectar, y después en la forma a la que sigue el flujo.",
    "words_in": "Texto de la forma",
    "connect": "Conectar",
    "connect_now": "Ahora haz clic en la forma a la que va.",
    "goes_to": "Va a",
    "nothing_yet": "nada todavía",
    "delete": "Eliminar",
    "check": "Comprobar el diseño",
    "checked_good": "El diseño funciona: un solo Inicio, todas las formas alcanzables y todos los caminos terminan en un Fin.",
    "problems": "{n} cosas que revisar",
    "h_info": "Cómo dibujar a mano",
    "h_add_how": "Haz clic en una forma de arriba para añadirla debajo de la que estás usando, o arrástrala al papel donde la quieras. Básicas, Flujo, Datos y Otras abren cada una un menú con todas las demás formas.",
    "h_mouse": "Ratón y pantalla táctil",
    "h_keys": "Teclas",
    "h_all_keys": "Todos los atajos de teclado",
    "hm_pick": "Elegir una forma o una flecha",
    "hm_move": "Mover una forma, o todas las seleccionadas",
    "hm_size": "Agrandar o reducir la forma elegida",
    "hm_join": "Trazar una flecha hacia otra forma",
    "hm_type": "Escribir en una forma o sobre una flecha",
    "hm_menu": "Ver todo lo que puedes hacer con ella",
    "hm_zoom": "Acercar o alejar",
    "hm_rule": "Cambiar a la forma que sugieren las reglas, o dejarla (la marca ámbar)",
    "hm_select": "Elige Seleccionar abajo y arrastrar sobre el papel seleccionará formas en vez de moverte, también con el dedo.",
    "many_head": "{n} formas seleccionadas",
    "as_chart": "Diagrama",
    "untitled": "Sin título",
    "p_no_start": "Nada inicia el flujo: todas las formas tienen algo que llega a ellas.",
    "p_many_starts": "{n} formas no tienen nada que llegue a ellas. Un diagrama empieza en un solo sitio.",
    "p_start_kind": "La forma por la que todo empieza debería ser la forma de Inicio / Fin ({shape}).",
    "p_no_end": "No hay Fin: ninguna forma de Inicio / Fin ({shape}) donde el flujo se detenga.",
    "p_unreached": "Nada lleva a esta forma.",
    "p_dead_end": "No sale nada de esta forma y no es un Fin.",
    "p_decision_out": "Una decisión necesita dos salidas, una por respuesta. Esta tiene {n}.",
    "p_one_out": "Esta forma tiene {n} salidas. Solo una decisión puede tener más de una.",
    "p_same_labels": "Las dos salidas de esta decisión dicen lo mismo.",
    "p_no_label": "Una salida de una decisión necesita una palabra.",
    "p_trapped": "Si el flujo llega aquí, nunca podrá llegar a un Fin.",
    "p_empty": "Esta forma no tiene nada escrito.",
    "p_overlap": "Esta forma está encima de otra.",
    "p_alone": "Esta forma no está unida a nada.",
    "p_line_through": "Una línea atraviesa esta forma. Mueve un poco alguna de las dos.",
    "hf_start": "Poner un Inicio encima",
    "hf_end": "Añadir un Fin y unir el flujo a él",
    "hf_to_end": "Unirla al Fin",
    "hf_write": "Escribir {word} dentro",
    "hf_type": "Escribir dentro",
    "hf_arrow": "Trazar una flecha desde aquí",
    "hf_yes_no": "Rotularlas {yes} y {no}",
    "hf_label": "Rotular la otra {word}",
    "hf_relabel": "Cambiar la segunda a {word}",
    "hf_apart": "Apartarla",
    "hf_clear": "Sacarla de la línea",
    "hp_next": "Añadir el paso siguiente",
    "hp_what_next": "¿Qué viene después?",
    "hp_into": "Meter un paso en ella",
    "m_colors": "Colores", "m_more_shapes": "Más formas",
    "sg_basic": "Básicas", "sg_flow": "Flujo", "sg_data": "Datos", "sg_other": "Otras",
    "hr_head": "Reglas de formas",
    "hr_says": "Esto parece «{role}». Las reglas de formas usan para eso: {shape}.",
    "hr_change": "Cambiar a {shape}",
    "hr_keep": "Dejarla así",
    "hr_tip": "Las reglas de formas sugieren otra forma",
    "hl_head": "Alinear",
    "hl_left": "Alinear bordes izquierdos",
    "hl_center": "Alinear centros",
    "hl_right": "Alinear bordes derechos",
    "hl_top": "Alinear bordes superiores",
    "hl_middle": "Alinear mitades",
    "hl_bottom": "Alinear bordes inferiores",
    "hl_across": "Repartir a lo ancho",
    "hl_down": "Repartir a lo alto",
    "mv_head": "¿Devolver los bloques movidos?",
    "mv_said": "Volver a construir dispone el diagrama de nuevo, y cada bloque que moviste vuelve a donde lo pone el diseño. Deshacer puede recuperar los movimientos.",
    "mv_yes": "Construir de todos modos",
    "side_chart": "Diagrama", "side_colors": "Estilo", "hide_panel": "Ocultar el panel", "show_panel": "Mostrar el panel",
    "theme": "Claro u oscuro", "theme_auto": "Auto", "theme_light": "Claro", "theme_dark": "Oscuro",
    "puzzles": "Retos",
    "pz_one": "Reto {n}",
    "pz_head": "Retos",
    "pz_l1": "Encuentra el fallo",
    "pz_l2": "Haz que funcione",
    "pz_l3": "Constrúyelo",
    "pz_check": "Comprobar",
    "pz_right": "Resuelto.",
    "pz_wrong": "Todavía no. Con {give} dijo {said}.",
    "pz_next": "Siguiente reto", "pz_next_level": "Siguiente nivel",
    "pz_job": "Lo que debe hacer", "pz_now": "Lo que hace ahora",
    "pz_reset": "Empezar de nuevo", "pz_all": "Todos los retos",
    "pz_broke": "Se paró antes de terminar. Le dieron {give}.",
    "pz_none": "Aún no hay nada que comprobar.",
    "pz_locked": "Resuelve {n} más para abrir estos",
    "pz_done": "{done} de {all} resueltos",
    "pz_nothing": "(nada)",
    "pz_brief": "El reto",
    "z_greet_b": "Saluda antes de preguntar a quién. Primero preguntar, luego saludar.",
    "z_range_b": "Del 1 al 9 debería estar en el rango. Ahora lo está cualquier número.",
    "z_double_b": "Debería mostrar el doble del número que le dan.",
    "z_order_b": "Debería mostrar el total final, 6, y nada por el camino.",
    "z_until_b": "Debería contar 1, 2, 3 y luego parar.",
    "z_nested_b": "Dos filas de dos: 1, 2, 2, 4. Al bucle interior le falta uno.",
    "z_param_b": "mostrar() muestra la letra x en vez del número que le pasaron.",
    "z_many_b": "De los cinco números escritos, debería decir cuántos pasan de 10.",
    "z_divide_b": "Suma cuatro números, así que el promedio es entre cuatro, no cinco.",
    "z_sign_b": "Sobre cero es positivo, debajo negativo, y cero es “cero”.",
    "z_twice_b": "Debería mostrar la palabra dos veces.",
    "z_minus_b": "Debería restar el segundo número del primero.",
    "z_early_b": "Muestra la respuesta antes de calcularla. Debería mostrar el triple.",
    "z_never_b": "Debería contar de 5 a 1. Ahora no muestra nada.",
    "z_odds_b": "Debería sumar los pares del 1 al 10, que dan 30.",
    "z_asked_b": "Debería pedir tres números y sumar esos tres.",
    "z_onemore_b": "Debería sumar del 1 al 10, que dan 55.",
    "z_valid_b": "Debería seguir preguntando hasta que sea del 1 al 10, y luego mostrarlo.",
    "z_smallest_b": "Debería mostrar el mayor de los cuatro números escritos.",
    "z_short_b": "sumar() toma dos números. Solo le dan uno.",
    "z_stops_b": "Debería mostrar de 5 a 1 y luego “ya”.",
    "pz_l4": "Fallos mas dificiles",
    "pz_l5": "Errores de verdad",
    "z_fizz_b": "15 debe decir FizzBuzz. Las pruebas están en mal orden.",
    "z_prime_b": "Un primo tiene exactamente dos divisores. Aquí el 1 cuenta como primo.",
    "z_digits_b": "Debe decir cuántas cifras tiene el número. El 7 tiene una.",
    "z_revzero_b": "Debe dar la vuelta a las cifras. 123 pasa a 321.",
    "z_sumd_b": "Debe sumar las cifras del número. 123 da 6.",
    "z_gridrow_b": "Tres filas: 1 2 3, luego 2 4 6, luego 3 6 9. La fila nunca cambia.",
    "z_tri_b": "Debe mostrar cada número triangular: 1, 3, 6, 10.",
    "z_lowhigh_b": "Debe mostrar el menor y luego el mayor de los cuatro números.",
    "z_starsrow_b": "Fila uno una estrella, fila dos dos estrellas, y así.",
    "z_factloop_b": "Cualquier cosa por cero es cero. 4 factorial es 24.",
    "z_report_b": "Entran cinco notas, así que el promedio es entre cinco.",
    "z_tries_b": "Tres intentos con la contraseña y luego bloqueado.",
    "z_discount_b": "Más de 50 lleva diez por ciento, así que 60 debe quedar en 54.",
    "z_convert_b": "De C a F son nueve quintos y luego más 32. 100 C son 212 F.",
    "z_tie_b": "Votos iguales deben decir que hay empate.",
    "z_fibstep_b": "Debe mostrar 0, 1, 1, 2, 3. Los dos números se mueven en mal orden.",
    "z_coins_b": "132 centavos son 1 dólar, 3 decenas y 2 centavos.",
    "z_score_b": "Una respuesta correcta vale uno, una mala no vale nada.",
    "z_sent_b": "Números hasta escribir 0, luego el promedio de los anteriores.",
    "z_menu0_b": "El 0 debe pararlo. Ahora vuelve a empezar.",
    "z_else_b": "A los menores de 18 no se les dice nada. Debería decir “fuera”.",
    "z_swap_b": "Más de 10 es grande y 10 o menos es pequeño. Aquí está al revés.",
    "z_count_b": "Debería contar del 1 al 5.",
    "z_forever_b": "Debería mostrar 3, 2, 1 y luego “ya”. Ahora no para nunca.",
    "z_total_b": "Debería sumar 1, 2, 3 y 4 y mostrar 10.",
    "z_two_b": "Debería sumar dos números y mostrar el resultado.",
    "z_return_b": "doble() debería devolver el número doblado para que Display lo muestre.",
    "z_evens_b": "Debería mostrar solo los números pares del 1 al 10.",
    "z_grade_b": "60 aprueba. Ahora mismo 60 suspende.",
    "e_add": "Sumar dos números",
    "e_oddeven": "Par o impar",
    "e_guess": "Adivina el número",
    "e_swap": "Intercambiar dos números",
    "e_factorial": "Un factorial",
    "try_short": "¿Primera vez?",
    "try_go": "Probar un ejemplo",
    "e_area": "Área de un rectángulo",
    "e_sumevens": "Sumar los pares",
    "e_vowel": "Vocal o no",
    "e_leap": "Año bisiesto",
    "e_backwards": "Contar hacia atrás",
    "eg_l4": "Programas del día a día",
    "eg_l5": "Proyectos más grandes",
    "e_bank": "Una cuenta bancaria",
    "e_gradebook": "Un registro de notas",
    "e_paycheck": "Nóminas semanales",
    "e_convert": "Un conversor de unidades",
    "e_splitcheck": "Dividir la cuenta",
    "e_vending": "Una máquina expendedora",
    "e_primelist": "Primos hasta un límite",
    "e_weekday": "¿Qué día de la semana?",
    "e_loan": "Pagar un préstamo",
    "e_rps": "Piedra, papel o tijera",
    # ---- a name for a program nobody named, from what it does (09-names.js)
    "d_rps": "Piedra, papel o tijera",
    "d_weekday": "Día de la semana",
    "d_leap": "Año bisiesto",
    "d_bank": "Cuenta bancaria",
    "d_loan": "Pago de un préstamo",
    "d_budget": "Análisis de presupuesto",
    "d_rise": "Aumento de {what}",
    "d_fall": "Disminución de {what}",
    "d_doubling": "Duplicación de {what}",
    "d_pop_growth": "Crecimiento de la población",
    "d_compound": "Interés compuesto",
    "d_to": "{from} a {to}",
    "d_total_of": "Total de {what}",
    "d_average_of": "Promedio de {what}",
    "d_pay": "Nómina",
    "d_tip": "Calculadora de propinas",
    "d_vending": "Máquina expendedora",
    "d_change": "Cambio en monedas",
    "d_shop": "Precio con descuento",
    "d_price": "Precio de compra",
    "d_convert": "Conversor de unidades",
    "d_temps": "Celsius a Fahrenheit",
    "d_temps_any": "Conversor de temperaturas",
    "d_primes": "Números primos",
    "d_prime": "Comprobación de números primos",
    "d_fizz": "FizzBuzz",
    "d_gcd": "Máximo común divisor",
    "d_fib": "Números de Fibonacci",
    "d_factorial": "Factorial",
    "d_reverse": "Cifras al revés",
    "d_digits": "Número de cifras",
    "d_gradebook": "Libro de calificaciones",
    "d_grades": "Nota en letra",
    "d_votes": "Recuento de votos",
    "d_quiz": "Cuestionario",
    "d_login": "Comprobación de contraseña",
    "d_guess": "Adivina el número",
    "d_vowel": "Comprobación de vocales",
    "d_stars": "Triángulo de estrellas",
    "d_grid": "Tabla de multiplicar completa",
    "d_table": "Tabla de multiplicar",
    "d_minmax": "Número menor y mayor",
    "d_biggest": "Número mayor",
    "d_scores": "Resumen de notas",
    "d_average": "Promedio",
    "d_sumevens": "Suma de los números pares de {a} a {b}",
    "d_sumevens_any": "Suma de los números pares",
    "d_oddeven": "Par o impar",
    "d_swap": "Intercambio de dos valores",
    "d_area": "Área de un rectángulo",
    "d_menu": "Menú de opciones",
    "d_down_n": "Cuenta atrás desde {n}",
    "d_down": "Cuenta atrás",
    "d_in_range": "Validación de datos",
    "d_sum": "Suma de {a} a {b}",
    "d_sum_any": "Total acumulado",
    "d_count": "Contar de {a} a {b}",
    "d_add": "Suma de dos números",
    "d_greet": "Saludo",
    "d_checks": "Comprobación de {what}",
    "d_while": "Bucle de {what}",
    "d_until": "Bucle de {what}",
    "d_repeats": "Bucle de {a} a {b}",
    "d_uses": "{names}",
    "d_asks": "Introducir {what}",
    "d_asks_shows": "Calculadora de {what}",
    "d_one": "un número",
    "d_two": "dos números",
    "d_three": "tres números",
    "d_numbers": "{n} números",
    "d_circle": "Área de un círculo",
    "d_roman": "Números romanos",
    "d_dice": "Tirada de dados",
    "d_coin": "Lanzamiento de moneda",
    "d_reverse_text": "Palabra al revés",
    "d_count_of": "Número de {what}",
    "d_per": "{a} por {b}",
    "d_number": "número",
    "d_and": "y",
    "e_fizz": "Fizz y Buzz",
    "e_prime": "¿Es primo?",
    "e_gcd": "Máximo común divisor",
    "e_digits": "Cuántas cifras",
    "e_reverse": "El número al revés",
    "e_grid": "Una cuadrícula de tablas",
    "e_minmax": "El menor y el mayor",
    "e_stars": "Un triángulo de estrellas",
    "e_report": "Un informe de clase",
    "e_login": "Tres intentos de contraseña",
    "e_shop": "Una caja con descuento",
    "e_temps": "Celsius, Fahrenheit y Kelvin",
    "e_votes": "Contar votos",
    "e_fib": "Los números de Fibonacci",
    "e_change": "Dólares, decenas y centavos",
    "e_quiz": "Un test de tres preguntas",
    "e_sentinel": "Números hasta escribir 0",
    "e_picktable": "La tabla que quieras",
    "eg_head": "Ejemplos",
    "eg_more": "Más ejemplos",
    "eg_l1": "Primeros pasos",
    "eg_l2": "Decisiones y bucles",
    "eg_l3": "Números y patrones",
    "e_ask": "Preguntar y mostrar",
    "e_decide": "Una decisión",
    "e_count": "Contar",
    "e_total": "Una suma acumulada",
    "e_while": "Un bucle While",
    "e_grades": "Notas",
    "e_biggest": "El mayor de tres",
    "e_menu": "Un menú",
    "e_keepasking": "Seguir preguntando",
    "e_module": "Un módulo",
    "e_answers": "Una función que devuelve",
    "e_countdown": "Cuenta atrás",
    "try_one": "¿Es tu primera vez? Empieza con uno de estos:",
    "eg_decision": "Una decisión", "eg_loop": "Un bucle", "eg_module": "Un módulo",
    "r_pace": "Cómo se ejecuta", "r_at_once": "De una vez",
    "r_by_step": "Uno a uno", "r_next": "Siguiente paso",
    "r_timed": "Al ritmo del programa",
    "chart_desc": "Diagrama de flujo con {n} formas: {kinds}.",
    "yes_plain": "Sí", "no_plain": "No",
    "more_head": "Opciones del diagrama",
    "o_words": "Idioma y palabras",
    "o_chains": "Encadenar los If largos hacia abajo",
    "o_shapes": "Las formas", "o_paper": "Espaciado y papel",
    "o_for": "Bucles For", "o_for_wide": "Desplegado", "o_for_hex": "Un hexágono",
    "o_everyout": "Un símbolo por cada Mostrar",
    "o_roomy": "Amplio: desplegado, con espacio en cada paso",
    "o_tight": "Compacto: menos figuras, plegado en un bloque",
    "o_columns": "Dividir un diagrama alto en columnas",
    "o_steady": "El mismo dibujo siempre",
    "more": "Opciones", "more_tip": "Más opciones del diagrama",
    "decide": "Decisiones",
    "undo": "Deshacer", "redo": "Rehacer",
    "settings": "Ajustes", "appearance": "Apariencia", "panel_side": "Lado del panel",
    "side_left": "Izquierda", "side_right": "Derecha", "full_screen": "Pantalla completa",
    "full_on": "Llenar la pantalla", "full_off": "Salir de pantalla completa",
    "no_full": "Este navegador no admite pantalla completa.",
    "app_install": "Instalar como app",
    "app_tip": "Un icono en tu pantalla de inicio o con tus otras apps, que se "
               "abre en su propia ventana -- y funciona sin conexión",
    "app_ios": "Toca Compartir y luego Añadir a la pantalla de inicio.",
    "app_mac": "En Safari, abre el menú Archivo y elige Añadir al Dock.",
    "app_done": "Instalada: ya está con tus otras apps y funciona sin conexión.",
    "p_ink": "Tinta", "p_classic": "Clásica", "p_slate": "Pizarra",
    "p_meadow": "Pradera", "p_sunset": "Ocaso", "p_night": "Noche",
    "pseudocode": "Pseudocódigo", "title": "Título",
    "code_big": "Llenar la pantalla", "code_small": "Volver al panel", "done": "Listo",
    "code_lines": "{n} líneas",
    "code_ask": "Introduce {name}: ",
    "code_shares": "lo que comparte el programa",
    "c_head": "Código", "c_write": "Escribir el código",
    "c_one": "En un solo archivo", "c_apart": "Varios archivos",
    "c_files_tip": "Un solo archivo, o uno por diagrama — y un diagrama de un solo flujo se divide en partes si es lo bastante largo",
    "c_one_chart": "Demasiado corto para dividirlo: sale en un solo archivo.",
    "c_cut_into": "Sin módulos: se divide en {n} partes y lo que comparten.",
    "c_files": "{n} archivos", "c_save_all": "Guardarlos todos",
    "c_writing": "Escribiéndolo…",
    "c_zipped": "{n} archivos, en un .zip",
    "your_name": "Tu nombre", "shape": "Forma",
    "language": "Idioma", "key_switch": "Leyenda",
    "tint_switch": "Tintes", "build": "Dibujar el diagrama",
    "drawing": "Dibujando…",
    "no_code": "Todavía no hay pseudocódigo que dibujar.",
    "failed": "No se pudo dibujar.",
    "not_answering": "El estudio no responde ({err}).",
    "empty_chart": "Pega tu pseudocódigo a la izquierda y pulsa Dibujar.",
    "shape_auto": "Automática", "shape_square": "Cuadrada",
    "shape_wide": "Ancha 16:9", "shape_page": "Página", "shape_tall": "Alta",
    "already": "Ya está ahí {path}",
    "copied": "Copiados {n} archivos en {dir}",
    "wrote": "Escrito {path}",
    "open_this": "<- abre este: muestra el diagrama y tiene los enlaces "
                 "de descarga",
    "style_seed": "Semilla de estilo {seed} (usa --seed {seed} para "
                  "volver a dibujarlo igual)",
    "nothing": "No se dio pseudocódigo: no hay nada que dibujar.",
    "studio_at": "El estudio de diagramas está en {url}",
    "leave_open": "Deja esta ventana abierta mientras lo usas; pulsa "
                  "Ctrl+C para detenerlo.",
    "stopped": "Estudio detenido.",
    "site_done": "Esa carpeta es un sitio web. Súbela a GitHub Pages (o "
                 "a cualquier host de archivos) y funcionará igual que "
                 "aquí; los pasos están en {dir}/README.md.",
    "starting": "Iniciando Python en el navegador…",
    "k_head": "Atajos de teclado",
    "k_tip": "Todas las teclas que entiende esta página (?)",
    "k_any": "En cualquier sitio",
    "k_code": "Escribiendo pseudocódigo",
    "k_shape": "Con una forma elegida",
    "k_hand": "Dibujando a mano",
    "k_build": "Dibujar el diagrama (a mano: comprobarlo)",
    "k_undo": "Deshacer y rehacer",
    "k_zoom": "Acercar, alejar, tamaño real",
    "k_close": "Cerrar lo que esté abierto",
    "k_keys": "Mostrar esta lista",
    "k_indent": "Sangrar las líneas, o quitarles la sangría",
    "k_enter": "Una línea nueva, con la sangría que le toca",
    "k_look": "Negrita, cursiva, subrayado",
    "k_size": "Letra más grande o más pequeña",
    "k_next": "La forma siguiente, o la anterior",
    "k_nudge": "Moverla un poco (Mayús: más)",
    "k_drop": "Soltarla",
    "k_lasso": "Seleccionar todas las formas dentro de un recuadro",
    "k_add": "Añadir una forma, o quitarla",
    "k_all": "Seleccionar todas las formas",
    "k_clip": "Copiar, cortar y pegar",
    "k_pan": "Moverse por el papel",
    "kn_ctrl": "Ctrl",
    "kn_shift": "Mayús",
    "kn_enter": "Intro",
    "kn_del": "Supr",
    "kn_space": "Espacio",
    "kn_click": "clic",
    "kn_drag": "arrastrar",
    "kn_dblclick": "doble clic",
    "kn_rclick": "clic derecho",
    "kn_hold": "mantener pulsado",
    "kn_wheel": "rueda",
    "kn_pinch": "pellizcar",
    "kn_corner": "arrastrar una esquina",
    "kn_dot": "arrastrar un punto",
    "kn_plus": "clic en +",
    "b_about": "Cuánto le falta al dibujo",
    "b_boot": "Iniciando Python en el navegador",
    "b_read": "Leyendo el pseudocódigo",
    "b_lay": "Colocando las formas",
    "b_draw": "Dibujando el diagrama",
    "b_page": "Poniéndolo en la página",
    "ready": "Listo.",
    "boot_failed": "Python no pudo iniciarse en este navegador ({err}).",
    "py_gave_out": "Python se detuvo en este navegador a mitad de este dibujo ({err}).",
    # ================================================================
    #  The programs it offers, written out in full: the fifty examples
    #  (e_ask_p is the one the button e_ask opens) and the fifty
    #  puzzles (z_else_p).  The keywords stay in English -- Display,
    #  If, While are what you type -- and everything else is in this
    #  language: what it says, and what it calls its boxes, modules
    #  and functions (plain letters only, which every language the
    #  code is written out in accepts).  Each is the English program
    #  line for line, and each puzzle has the same fault.
    # ================================================================
    # ---- the examples: getting started
    "e_ask_p": program("""
        Start
        Declare String nombre
        Display "¿Cómo te llamas?"
        Input nombre
        Display "Hola"
        Display nombre
        Stop
    """),
    "e_add_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Display "Dos números, por favor"
        Input a
        Input b
        Display "Suman"
        Display a + b
        Stop
    """),
    "e_swap_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Declare Integer copia
        Input a
        Input b
        copia = a
        a = b
        b = copia
        Display a
        Display b
        Stop
    """),
    "e_decide_p": program("""
        Start
        Declare Integer edad
        Display "¿Cuántos años tienes?"
        Input edad
        If edad >= 18 Then
            Display "Ya puedes votar"
        Else
            Display "Todavía no puedes votar"
        End If
        Stop
    """),
    "e_oddeven_p": program("""
        Start
        Declare Integer n
        Display "Escribe un número"
        Input n
        If n mod 2 = 0 Then
            Display "par"
        Else
            Display "impar"
        End If
        Stop
    """),
    "e_count_p": program("""
        Start
        For i = 1 To 5
            Display i
        End For
        Stop
    """),
    "e_while_p": program("""
        Start
        Declare Integer n
        n = 1
        While n <= 5
            Display n
            n = n + 1
        End While
        Stop
    """),
    "e_total_p": program("""
        Start
        Declare Integer total
        total = 0
        For i = 1 To 10
            total = total + i
        End For
        Display "El total es"
        Display total
        Stop
    """),
    "e_module_p": program("""
        Start
        Declare String nombre
        Input nombre
        Call saludar(nombre)
        Stop

        Module saludar(quien)
            Display "Hola"
            Display quien
        End Module
    """),
    "e_answers_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Declare Integer suma
        Input a
        Input b
        suma = sumar(a, b)
        Display "La respuesta es"
        Display suma
        Stop

        Function sumar(x, y)
            Return x + y
        End Function
    """),
    # ---- the examples: decisions and loops
    "e_grades_p": program("""
        Start
        Declare Integer nota
        Display "Escribe la nota"
        Input nota
        If nota >= 90 Then
            Display "A"
        Else If nota >= 80 Then
            Display "B"
        Else If nota >= 70 Then
            Display "C"
        Else If nota >= 60 Then
            Display "D"
        Else
            Display "F"
        End If
        Stop
    """),
    "e_biggest_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Declare Integer c
        Declare Integer mayor
        Input a
        Input b
        Input c
        mayor = a
        If b > mayor Then
            mayor = b
        End If
        If c > mayor Then
            mayor = c
        End If
        Display "El mayor es"
        Display mayor
        Stop
    """),
    "e_menu_p": program("""
        Start
        Declare Integer opcion
        Display "1 sumar  2 restar  3 salir"
        Input opcion
        Select Case opcion
            Case 1
                Display "Sumando"
            Case 2
                Display "Restando"
            Case Else
                Display "Adiós"
        End Select
        Stop
    """),
    "e_vowel_p": program("""
        Start
        Declare String letra
        Display "Escribe una letra"
        Input letra
        Select Case letra
            Case "a"
                Display "vocal"
            Case "e"
                Display "vocal"
            Case "i"
                Display "vocal"
            Case "o"
                Display "vocal"
            Case "u"
                Display "vocal"
            Case Else
                Display "no es vocal"
        End Select
        Stop
    """),
    "e_leap_p": program("""
        Start
        Declare Integer anio
        Display "¿Qué año?"
        Input anio
        If anio mod 400 = 0 Then
            Display "año bisiesto"
        Else If anio mod 100 = 0 Then
            Display "no es bisiesto"
        Else If anio mod 4 = 0 Then
            Display "año bisiesto"
        Else
            Display "no es bisiesto"
        End If
        Stop
    """),
    "e_keepasking_p": program("""
        Start
        Declare Integer n
        Do
            Display "Escribe un número del 1 al 10"
            Input n
        Until n >= 1 And n <= 10
        Display "Gracias"
        Stop
    """),
    "e_backwards_p": program("""
        Start
        Declare Integer n
        Display "¿Desde qué número cuento hacia atrás?"
        Input n
        For i = n To 1 Step -1
            Display i
        End For
        Display "Listo"
        Stop
    """),
    "e_sumevens_p": program("""
        Start
        Declare Integer total
        total = 0
        For i = 1 To 20
            If i mod 2 = 0 Then
                total = total + i
            End If
        End For
        Display "Los pares suman"
        Display total
        Stop
    """),
    "e_countdown_p": program("""
        Start
        Declare Integer n
        n = 10
        While n > 0
            Display n
            If n = 5 Then
                Display "A mitad de camino"
            End If
            n = n - 1
        End While
        Display "¡Despegue!"
        Stop
    """),
    "e_guess_p": program("""
        Start
        Declare Integer secreto
        Declare Integer intento
        secreto = 7
        Do
            Display "Adivina mi número"
            Input intento
            If intento < secreto Then
                Display "Más alto"
            End If
            If intento > secreto Then
                Display "Más bajo"
            End If
        Until intento = secreto
        Display "¡Acertaste!"
        Stop
    """),
    # ---- the examples: numbers and patterns
    "e_fizz_p": program("""
        Start
        For i = 1 To 15
            If i mod 15 = 0 Then
                Display "FizzBuzz"
            Else If i mod 3 = 0 Then
                Display "Fizz"
            Else If i mod 5 = 0 Then
                Display "Buzz"
            Else
                Display i
            End If
        End For
        Stop
    """),
    "e_prime_p": program("""
        Start
        Declare Integer n
        Declare Integer divisores
        Display "Escribe un número"
        Input n
        divisores = 0
        For i = 1 To n
            If n mod i = 0 Then
                divisores = divisores + 1
            End If
        End For
        If divisores = 2 Then
            Display "primo"
        Else
            Display "no es primo"
        End If
        Stop
    """),
    "e_gcd_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Display "Dos números, por favor"
        Input a
        Input b
        While a <> b
            If a > b Then
                a = a - b
            Else
                b = b - a
            End If
        End While
        Display "El máximo común divisor es"
        Display a
        Stop
    """),
    "e_digits_p": program("""
        Start
        Declare Integer n
        Declare Integer cuantas
        Display "Escribe un número entero"
        Input n
        cuantas = 0
        While n > 0
            n = n div 10
            cuantas = cuantas + 1
        End While
        Display "Cantidad de cifras:"
        Display cuantas
        Stop
    """),
    "e_reverse_p": program("""
        Start
        Declare Integer n
        Declare Integer invertido
        Display "Escribe un número entero"
        Input n
        invertido = 0
        While n > 0
            invertido = invertido * 10 + n mod 10
            n = n div 10
        End While
        Display "Al revés es"
        Display invertido
        Stop
    """),
    "e_fib_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Declare Integer siguiente
        a = 0
        b = 1
        For i = 1 To 10
            Display a
            siguiente = a + b
            a = b
            b = siguiente
        End For
        Stop
    """),
    "e_factorial_p": program("""
        Start
        Declare Integer n
        Declare Integer resultado
        Display "Escribe un número"
        Input n
        resultado = 1
        For i = 1 To n
            resultado = resultado * i
        End For
        Display "El factorial es"
        Display resultado
        Stop
    """),
    "e_minmax_p": program("""
        Start
        Declare Integer n
        Declare Integer menor
        Declare Integer mayor
        Display "Cinco números, por favor"
        Input n
        menor = n
        mayor = n
        For i = 2 To 5
            Input n
            If n < menor Then
                menor = n
            End If
            If n > mayor Then
                mayor = n
            End If
        End For
        Display "Menor"
        Display menor
        Display "Mayor"
        Display mayor
        Stop
    """),
    "e_grid_p": program("""
        Start
        For fila = 1 To 5
            For columna = 1 To 5
                Display fila * columna
            End For
        End For
        Stop
    """),
    "e_stars_p": program("""
        Start
        Declare String linea
        Declare Integer n
        Display "¿Cuántas filas?"
        Input n
        For fila = 1 To n
            linea = ""
            For columna = 1 To fila
                linea = linea + "*"
            End For
            Display linea
        End For
        Stop
    """),
    # ---- the examples: everyday programs
    "e_area_p": program("""
        Start
        Declare Integer ancho
        Declare Integer alto
        Display "¿Cuánto mide de ancho?"
        Input ancho
        Display "¿Cuánto mide de alto?"
        Input alto
        Display "El área es"
        Display ancho * alto
        Stop
    """),
    "e_change_p": program("""
        Start
        Declare Integer centavos
        Display "¿Cuántos centavos?"
        Input centavos
        Display "Dólares"
        Display centavos div 100
        centavos = centavos mod 100
        Display "Decenas"
        Display centavos div 10
        Display "Centavos"
        Display centavos mod 10
        Stop
    """),
    "e_temps_p": program("""
        Start
        Declare String escalaDe
        Declare String escalaA
        Declare Real grados
        Declare Real celsius
        Declare Real resultado
        Declare String otra
        Do
            escalaDe = pedirEscala("¿Convertir de C, F o K?")
            escalaA = pedirEscala("¿Convertir a C, F o K?")
            Display "¿La temperatura?"
            Input grados
            celsius = aCelsius(grados, escalaDe)
            resultado = round(deCelsius(celsius, escalaA) * 100) / 100
            Display grados, " ", escalaDe, " son ", resultado, " ", escalaA
            Display "¿Otra? s o n"
            Input otra
        Until toupper(otra) <> "S"
        Stop

        Function pedirEscala(pregunta)
            Declare String escala
            Display pregunta
            Input escala
            escala = toupper(escala)
            While escala <> "C" And escala <> "F" And escala <> "K"
                Display "Escribe C, F o K, por favor"
                Input escala
                escala = toupper(escala)
            End While
            Return escala
        End Function

        Function aCelsius(g, escala)
            If escala = "F" Then
                Return (g - 32) * 5 / 9
            Else If escala = "K" Then
                Return g - 273.15
            Else
                Return g
            End If
        End Function

        Function deCelsius(g, escala)
            If escala = "F" Then
                Return g * 9 / 5 + 32
            Else If escala = "K" Then
                Return g + 273.15
            Else
                Return g
            End If
        End Function
    """),
    "e_shop_p": program("""
        Start
        Declare Integer cantidad
        Declare Real precio
        Declare Real total
        Display "¿Cuántos?"
        Input cantidad
        Display "¿Precio por unidad?"
        Input precio
        total = cantidad * precio
        If total > 50 Then
            total = total * 0.9
            Display "Diez por ciento de descuento"
        End If
        Display "Total a pagar: $", total
        Stop
    """),
    "e_report_p": program("""
        Start
        Declare Integer nota
        Declare Integer total
        Declare Integer aprobados
        Declare Integer mejor
        total = 0
        aprobados = 0
        mejor = 0
        For i = 1 To 5
            Display "Escribe una nota"
            Input nota
            total = total + nota
            If nota >= 60 Then
                aprobados = aprobados + 1
            End If
            If nota > mejor Then
                mejor = nota
            End If
        End For
        Display "Aprobados"
        Display aprobados
        Display "Promedio"
        Display total / 5
        Display "Mejor"
        Display mejor
        Stop
    """),
    "e_votes_p": program("""
        Start
        Declare String voto
        Declare Integer rojos
        Declare Integer azules
        rojos = 0
        azules = 0
        For i = 1 To 5
            Display "¿rojo o azul?"
            Input voto
            If voto = "rojo" Then
                rojos = rojos + 1
            Else
                azules = azules + 1
            End If
        End For
        Display "Rojo"
        Display rojos
        Display "Azul"
        Display azules
        If rojos > azules Then
            Display "Gana el rojo"
        Else If azules > rojos Then
            Display "Gana el azul"
        Else
            Display "Empate"
        End If
        Stop
    """),
    "e_quiz_p": program("""
        Start
        Declare Integer puntos
        puntos = 0
        puntos = puntos + preguntar("¿2 más 2?", 4)
        puntos = puntos + preguntar("¿5 por 3?", 15)
        puntos = puntos + preguntar("¿10 menos 7?", 3)
        Display "Tu puntuación"
        Display puntos
        Stop

        Function preguntar(pregunta, respuesta)
            Declare Integer dicho
            Display pregunta
            Input dicho
            If dicho = respuesta Then
                Display "Correcto"
                Return 1
            Else
                Display "Incorrecto"
                Return 0
            End If
        End Function
    """),
    "e_login_p": program("""
        Start
        Declare String clave
        Declare Integer intentos
        intentos = 0
        Do
            Display "¿Contraseña?"
            Input clave
            intentos = intentos + 1
        Until clave = "abierto" Or intentos = 3
        Call veredicto(clave)
        Stop

        Module veredicto(dicho)
            If dicho = "abierto" Then
                Display "Bienvenido"
            Else
                Display "Bloqueado"
            End If
        End Module
    """),
    "e_sentinel_p": program("""
        Start
        Declare Integer n
        Declare Integer total
        Declare Integer cuantos
        total = 0
        cuantos = 0
        Display "Números, por favor. 0 para terminar."
        Input n
        While n <> 0
            total = total + n
            cuantos = cuantos + 1
            Input n
        End While
        If cuantos > 0 Then
            Display "El promedio es"
            Display total / cuantos
        Else
            Display "No hay nada que promediar"
        End If
        Stop
    """),
    "e_picktable_p": program("""
        Start
        Declare Integer n
        Display "¿Qué tabla? 0 para parar."
        Input n
        While n > 0
            For i = 1 To 12
                Display n * i
            End For
            Display "¿Qué tabla? 0 para parar."
            Input n
        End While
        Display "Adiós"
        Stop
    """),
    # ---- the examples: bigger projects
    "e_bank_p": program("""
        Start
        Declare Real saldo
        Declare Integer opcion
        saldo = 0
        Do
            Display "1 depositar  2 retirar  3 saldo  4 salir"
            Input opcion
            Select Case opcion
                Case 1
                    Call depositar(saldo)
                Case 2
                    Call retirar(saldo)
                Case 3
                    Display "Tu saldo es $", saldo
                Case 4
                    Display "Adiós"
                Case Else
                    Display "Elige 1, 2, 3 o 4"
            End Select
        Until opcion = 4
        Stop

        Module depositar(Real Ref dinero)
            Declare Real cantidad
            Display "¿Cuánto quieres depositar?"
            Input cantidad
            If cantidad <= 0 Then
                Display "Un depósito tiene que ser mayor que cero"
            Else
                dinero = dinero + cantidad
                Display "Depositado: $", cantidad
            End If
        End Module

        Module retirar(Real Ref dinero)
            Declare Real cantidad
            Display "¿Cuánto quieres retirar?"
            Input cantidad
            If cantidad <= 0 Then
                Display "Un retiro tiene que ser mayor que cero"
            Else If cantidad > dinero Then
                Display "No hay suficiente dinero. Tienes $", dinero
            Else
                dinero = dinero - cantidad
                Display "Retirado: $", cantidad
            End If
        End Module
    """),
    "e_gradebook_p": program("""
        Start
        Declare Integer alumnos
        Declare Integer nota
        Declare Integer total
        Declare Integer maxima
        Declare Integer minima
        Declare Integer aprobados
        Declare String letra
        total = 0
        aprobados = 0
        maxima = 0
        minima = 100
        Display "¿Cuántos alumnos?"
        Input alumnos
        While alumnos < 1
            Display "Tiene que haber al menos un alumno"
            Input alumnos
        End While
        For i = 1 To alumnos
            Display "Nota del alumno ", i
            Input nota
            While nota < 0 Or nota > 100
                Display "Una nota va de 0 a 100. Inténtalo de nuevo"
                Input nota
            End While
            letra = notaEnLetra(nota)
            Display "Eso es una ", letra
            total = total + nota
            If letra <> "F" Then
                aprobados = aprobados + 1
            End If
            If nota > maxima Then
                maxima = nota
            End If
            If nota < minima Then
                minima = nota
            End If
        End For
        Display "Promedio de la clase: ", total / alumnos
        Display "Nota más alta: ", maxima
        Display "Nota más baja: ", minima
        Display "Alumnos aprobados: ", aprobados
        Stop

        Function String notaEnLetra(Integer puntos)
            If puntos >= 90 Then
                Return "A"
            Else If puntos >= 80 Then
                Return "B"
            Else If puntos >= 70 Then
                Return "C"
            Else If puntos >= 60 Then
                Return "D"
            Else
                Return "F"
            End If
        End Function
    """),
    "e_paycheck_p": program("""
        Start
        Constant Real TASA_IMPUESTO = 0.15
        Declare String nombre
        Declare Real horas
        Declare Real tarifa
        Declare Real bruto
        Declare Real impuesto
        Declare Integer pagados
        pagados = 0
        Display "¿Nombre del empleado? Escribe fin para terminar"
        Input nombre
        While nombre <> "fin"
            Display "¿Horas trabajadas esta semana?"
            Input horas
            Display "¿Tarifa por hora?"
            Input tarifa
            bruto = sueldoBruto(horas, tarifa)
            impuesto = bruto * TASA_IMPUESTO
            Display nombre, " ganó $", bruto
            Display "Impuestos retenidos: $", impuesto
            Display "Sueldo neto: $", bruto - impuesto
            pagados = pagados + 1
            Display "¿Nombre del empleado? Escribe fin para terminar"
            Input nombre
        End While
        Display "Nóminas hechas: ", pagados
        Stop

        Function Real sueldoBruto(Real trabajadas, Real porHora)
            Declare Real extras
            If trabajadas <= 40 Then
                Return trabajadas * porHora
            Else
                extras = trabajadas - 40
                Return 40 * porHora + extras * porHora * 1.5
            End If
        End Function
    """),
    "e_convert_p": program("""
        Start
        Declare Integer opcion
        Declare Real cantidad
        Do
            Display "1 millas a kilómetros"
            Display "2 libras a kilogramos"
            Display "3 Fahrenheit a Celsius"
            Display "4 pulgadas a centímetros"
            Display "5 salir"
            Input opcion
            If opcion >= 1 And opcion <= 4 Then
                Display "¿Cuántos?"
                Input cantidad
                Call convertir(opcion, cantidad)
            Else If opcion <> 5 Then
                Display "Elige un número del 1 al 5"
            End If
        Until opcion = 5
        Display "Adiós"
        Stop

        Module convertir(Integer cual, Real cantidad)
            Select Case cual
                Case 1
                    Display cantidad, " millas son ", cantidad * 1.609, " kilómetros"
                Case 2
                    Display cantidad, " libras son ", cantidad * 0.4536, " kilogramos"
                Case 3
                    Display cantidad, " F son ", (cantidad - 32) * 5 / 9, " C"
                Case Else
                    Display cantidad, " pulgadas son ", cantidad * 2.54, " centímetros"
            End Select
        End Module
    """),
    "e_splitcheck_p": program("""
        Start
        Declare Real cuenta
        Declare Real porcentaje
        Declare Integer personas
        Declare Real propina
        Display "¿Cuánto es la cuenta?"
        Input cuenta
        While cuenta <= 0
            Display "La cuenta tiene que ser mayor que cero"
            Input cuenta
        End While
        Display "¿Qué porcentaje de propina? Lo normal es 15, 18 o 20"
        Input porcentaje
        While porcentaje < 0 Or porcentaje > 100
            Display "Elige un porcentaje del 0 al 100"
            Input porcentaje
        End While
        Display "¿Entre cuántas personas se paga?"
        Input personas
        While personas < 1
            Display "Al menos una persona tiene que pagar"
            Input personas
        End While
        propina = cuenta * porcentaje / 100
        Call recibo(cuenta, propina, personas)
        Stop

        Module recibo(Real comida, Real extra, Integer cuantos)
            Declare Real total
            total = comida + extra
            Display "Comida y bebida: $", comida
            Display "Propina: $", extra
            Display "Total: $", total
            If cuantos = 1 Then
                Display "Lo pagas todo tú: $", total
            Else
                Display "Cada una de las ", cuantos, " personas paga $", total / cuantos
            End If
        End Module
    """),
    "e_vending_p": program("""
        Start
        Declare Integer precio
        Declare Integer pagado
        Declare Integer moneda
        Display "¿Cuánto cuesta el snack, en centavos?"
        Input precio
        While precio <= 0 Or precio mod 5 <> 0
            Display "Aquí los precios van de 5 en 5 centavos"
            Input precio
        End While
        pagado = 0
        While pagado < precio
            Display "Faltan ", precio - pagado, " centavos. Mete 5, 10 o 25"
            Input moneda
            Select Case moneda
                Case 5
                    pagado = pagado + moneda
                Case 10
                    pagado = pagado + moneda
                Case 25
                    pagado = pagado + moneda
                Case Else
                    Display "Esta máquina solo acepta monedas de 5, 10 y 25 centavos"
            End Select
        End While
        Display "Que lo disfrutes"
        If pagado > precio Then
            Call darCambio(pagado - precio)
        End If
        Stop

        Module darCambio(Integer centavos)
            Display "Tu cambio es de ", centavos, " centavos"
            Display "Monedas de 25: ", centavos div 25
            centavos = centavos mod 25
            Display "Monedas de 10: ", centavos div 10
            centavos = centavos mod 10
            Display "Monedas de 5: ", centavos div 5
        End Module
    """),
    "e_primelist_p": program("""
        Start
        Declare Integer limite
        Declare Integer hallados
        Declare Integer total
        Display "¿Buscar primos hasta qué número?"
        Input limite
        While limite < 2
            Display "Elige un número de 2 o más"
            Input limite
        End While
        hallados = 0
        total = 0
        For n = 2 To limite
            If esPrimo(n) Then
                Display n
                hallados = hallados + 1
                total = total + n
            End If
        End For
        Display "Primos hallados: ", hallados
        Display "Suman ", total
        Stop

        Function Boolean esPrimo(Integer numero)
            Declare Integer d
            d = 2
            While d * d <= numero
                If numero mod d = 0 Then
                    Return False
                End If
                d = d + 1
            End While
            Return True
        End Function
    """),
    "e_weekday_p": program("""
        Start
        Declare Integer anio
        Declare Integer mes
        Declare Integer dia
        Display "¿Año?"
        Input anio
        Display "¿Mes, del 1 al 12?"
        Input mes
        While mes < 1 Or mes > 12
            Display "Un mes va del 1 al 12"
            Input mes
        End While
        Display "¿Día del mes?"
        Input dia
        While dia < 1 Or dia > diasDe(mes, anio)
            Display "Ese mes tiene ", diasDe(mes, anio), " días"
            Input dia
        End While
        Display mes, "/", dia, "/", anio, " es ", nombreDia(diaSemana(anio, mes, dia))
        Stop

        Function Integer diasDe(Integer m, Integer y)
            Select Case m
                Case 2
                    If esBisiesto(y) Then
                        Return 29
                    Else
                        Return 28
                    End If
                Case 4
                    Return 30
                Case 6
                    Return 30
                Case 9
                    Return 30
                Case 11
                    Return 30
                Case Else
                    Return 31
            End Select
        End Function

        Function Boolean esBisiesto(Integer y)
            Return (y mod 4 = 0 And y mod 100 <> 0) Or y mod 400 = 0
        End Function

        Function Integer diaSemana(Integer y, Integer m, Integer d)
            Declare Integer k
            Declare Integer j
            If m < 3 Then
                m = m + 12
                y = y - 1
            End If
            k = y mod 100
            j = y div 100
            Return (d + 13 * (m + 1) div 5 + k + k div 4 + j div 4 + 5 * j) mod 7
        End Function

        Function String nombreDia(Integer h)
            Select Case h
                Case 0
                    Return "sábado"
                Case 1
                    Return "domingo"
                Case 2
                    Return "lunes"
                Case 3
                    Return "martes"
                Case 4
                    Return "miércoles"
                Case 5
                    Return "jueves"
                Case Else
                    Return "viernes"
            End Select
        End Function
    """),
    "e_loan_p": program("""
        Start
        Declare Real saldo
        Declare Real tasa
        Declare Real pago
        Declare Real interes
        Declare Real interesPagado
        Declare Integer meses
        Display "¿De cuánto es el préstamo?"
        Input saldo
        Display "¿Tasa de interés anual, en porcentaje?"
        Input tasa
        Display "¿Pago mensual?"
        Input pago
        interes = saldo * tasa / 100 / 12
        If pago <= interes Then
            Display "Así nunca se termina de pagar. Paga más de $", interes
        Else
            meses = 0
            interesPagado = 0
            While saldo > 0
                interes = saldo * tasa / 100 / 12
                interesPagado = interesPagado + interes
                saldo = saldo + interes - pago
                meses = meses + 1
                If meses mod 12 = 0 And saldo > 0 Then
                    Display "Después del año ", meses div 12, " todavía debes $", saldo
                End If
            End While
            Display "Pagado en ", meses, " meses"
            Display "El último pago es de solo $", pago + saldo
            Display "Intereses pagados en total: $", interesPagado
        End If
        Stop
    """),
    "e_rps_p": program("""
        Start
        Declare Integer jugador
        Declare Integer computadora
        Declare Integer resultado
        Declare Integer ganadas
        Declare Integer perdidas
        ganadas = 0
        perdidas = 0
        For partida = 1 To 5
            Display "Partida ", partida, ": 1 piedra, 2 papel, 3 tijera"
            Input jugador
            While jugador < 1 Or jugador > 3
                Display "Elige 1, 2 o 3"
                Input jugador
            End While
            computadora = random(1, 3)
            Display "Tú: ", nombreDe(jugador), "   Computadora: ", nombreDe(computadora)
            resultado = ganador(jugador, computadora)
            If resultado = 1 Then
                Display "Esta la ganas tú"
                ganadas = ganadas + 1
            Else If resultado = 2 Then
                Display "Esta la gana la computadora"
                perdidas = perdidas + 1
            Else
                Display "Empate"
            End If
        End For
        Display "Ganaste ", ganadas, " y perdiste ", perdidas
        If ganadas > perdidas Then
            Display "¡Le ganaste a la computadora!"
        Else If perdidas > ganadas Then
            Display "La computadora te ganó"
        Else
            Display "Empate en total"
        End If
        Stop

        Function String nombreDe(Integer eleccion)
            Select Case eleccion
                Case 1
                    Return "piedra"
                Case 2
                    Return "papel"
                Case Else
                    Return "tijera"
            End Select
        End Function

        Function Integer ganador(Integer a, Integer b)
            If a = b Then
                Return 0
            Else If (a - b + 3) mod 3 = 1 Then
                Return 1
            Else
                Return 2
            End If
        End Function
    """),
    # ---- the puzzles: find the fault
    "z_else_p": program("""
        Start
        Declare Integer edad
        Input edad
        If edad >= 18 Then
            Display "dentro"
        End If
        Stop
    """),
    "z_swap_p": program("""
        Start
        Declare Integer n
        Input n
        If n > 10 Then
            Display "pequeño"
        Else
            Display "grande"
        End If
        Stop
    """),
    "z_count_p": program("""
        Start
        For i = 1 To 4
            Display i
        End For
        Stop
    """),
    "z_greet_p": program("""
        Start
        Declare String nombre
        Display "Hola"
        Display nombre
        Input nombre
        Stop
    """),
    "z_range_p": program("""
        Start
        Declare Integer n
        Input n
        If n > 0 Or n < 10 Then
            Display "dentro del rango"
        Else
            Display "fuera del rango"
        End If
        Stop
    """),
    "z_double_p": program("""
        Start
        Declare Integer n
        Input n
        Display n
        Stop
    """),
    "z_sign_p": program("""
        Start
        Declare Integer n
        Input n
        If n > 0 Then
            Display "positivo"
        Else
            Display "negativo"
        End If
        Stop
    """),
    "z_twice_p": program("""
        Start
        Declare String palabra
        Input palabra
        Display palabra
        Stop
    """),
    "z_minus_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Input a
        Input b
        Display a + b
        Stop
    """),
    "z_early_p": program("""
        Start
        Declare Integer n
        Declare Integer resultado
        Input n
        Display resultado
        resultado = n * 3
        Stop
    """),
    # ---- the puzzles: make it work
    "z_forever_p": program("""
        Start
        Declare Integer n
        n = 3
        While n > 0
            Display n
        End While
        Display "ya"
        Stop
    """),
    "z_total_p": program("""
        Start
        Declare Integer total
        For i = 1 To 4
            total = 0
            total = total + i
        End For
        Display total
        Stop
    """),
    "z_two_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Input a
        Display a + b
        Stop
    """),
    "z_order_p": program("""
        Start
        Declare Integer total
        total = 0
        For i = 1 To 3
            total = total + i
            Display total
        End For
        Stop
    """),
    "z_until_p": program("""
        Start
        Declare Integer n
        n = 0
        Do
            n = n + 1
            Display n
        Until n > 0
        Stop
    """),
    "z_nested_p": program("""
        Start
        For fila = 1 To 2
            For columna = 1 To 1
                Display fila * columna
            End For
        End For
        Stop
    """),
    "z_never_p": program("""
        Start
        Declare Integer n
        n = 5
        While n > 5
            Display n
            n = n - 1
        End While
        Stop
    """),
    "z_odds_p": program("""
        Start
        Declare Integer total
        total = 0
        For i = 1 To 10
            If i mod 2 = 1 Then
                total = total + i
            End If
        End For
        Display total
        Stop
    """),
    "z_asked_p": program("""
        Start
        Declare Integer n
        Declare Integer total
        total = 0
        Input n
        For i = 1 To 3
            total = total + n
        End For
        Display total
        Stop
    """),
    "z_onemore_p": program("""
        Start
        Declare Integer total
        total = 0
        For i = 1 To 11
            total = total + i
        End For
        Display total
        Stop
    """),
    # ---- the puzzles: build it
    "z_grade_p": program("""
        Start
        Declare Integer nota
        Input nota
        If nota > 60 Then
            Display "aprobado"
        Else
            Display "suspenso"
        End If
        Stop
    """),
    "z_evens_p": program("""
        Start
        For i = 1 To 10
            Display i
        End For
        Stop
    """),
    "z_return_p": program("""
        Start
        Declare Integer n
        Input n
        Display doble(n)
        Stop

        Function doble(x)
            x = x * 2
        End Function
    """),
    "z_param_p": program("""
        Start
        Declare Integer n
        Input n
        Call mostrar(n)
        Stop

        Module mostrar(x)
            Display "x"
        End Module
    """),
    "z_many_p": program("""
        Start
        Declare Integer n
        Declare Integer cuantos
        For i = 1 To 5
            cuantos = 0
            Input n
            If n > 10 Then
                cuantos = cuantos + 1
            End If
        End For
        Display cuantos
        Stop
    """),
    "z_divide_p": program("""
        Start
        Declare Real total
        Declare Real n
        total = 0
        For i = 1 To 4
            Input n
            total = total + n
        End For
        Display total / 5
        Stop
    """),
    "z_valid_p": program("""
        Start
        Declare Integer n
        Do
            Input n
        Until n > 0
        Display "ok"
        Display n
        Stop
    """),
    "z_smallest_p": program("""
        Start
        Declare Integer n
        Declare Integer mejor
        mejor = 0
        For i = 1 To 4
            Input n
            If n < mejor Then
                mejor = n
            End If
        End For
        Display mejor
        Stop
    """),
    "z_short_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Input a
        Input b
        Display sumar(a)
        Stop

        Function sumar(x, y)
            Return x + y
        End Function
    """),
    "z_stops_p": program("""
        Start
        Declare Integer n
        n = 5
        While n > 1
            Display n
            n = n - 1
        End While
        Display "ya"
        Stop
    """),
    # ---- the puzzles: harder faults
    "z_fizz_p": program("""
        Start
        For i = 1 To 15
            If i mod 3 = 0 Then
                Display "Fizz"
            Else If i mod 5 = 0 Then
                Display "Buzz"
            Else If i mod 15 = 0 Then
                Display "FizzBuzz"
            Else
                Display i
            End If
        End For
        Stop
    """),
    "z_prime_p": program("""
        Start
        Declare Integer n
        Declare Integer divisores
        Input n
        divisores = 0
        For i = 1 To n
            If n mod i = 0 Then
                divisores = divisores + 1
            End If
        End For
        If divisores < 3 Then
            Display "primo"
        Else
            Display "no es primo"
        End If
        Stop
    """),
    "z_digits_p": program("""
        Start
        Declare Integer n
        Declare Integer cuantas
        Input n
        cuantas = 1
        While n > 0
            n = n div 10
            cuantas = cuantas + 1
        End While
        Display cuantas
        Stop
    """),
    "z_revzero_p": program("""
        Start
        Declare Integer n
        Declare Integer invertido
        Input n
        invertido = 0
        While n > 0
            invertido = invertido + n mod 10
            n = n div 10
        End While
        Display invertido
        Stop
    """),
    "z_sumd_p": program("""
        Start
        Declare Integer n
        Declare Integer total
        Input n
        total = 0
        While n > 0
            total = total + n div 10
            n = n div 10
        End While
        Display total
        Stop
    """),
    "z_gridrow_p": program("""
        Start
        For fila = 1 To 3
            For columna = 1 To 3
                Display fila * fila
            End For
        End For
        Stop
    """),
    "z_tri_p": program("""
        Start
        Declare Integer total
        total = 0
        For i = 1 To 4
            total = total + i
        End For
        Display total
        Stop
    """),
    "z_lowhigh_p": program("""
        Start
        Declare Integer n
        Declare Integer menor
        Declare Integer mayor
        menor = 0
        mayor = 0
        For i = 1 To 4
            Input n
            If n < menor Then
                menor = n
            End If
            If n > mayor Then
                mayor = n
            End If
        End For
        Display menor
        Display mayor
        Stop
    """),
    "z_starsrow_p": program("""
        Start
        Declare String linea
        For fila = 1 To 3
            linea = ""
            For columna = 1 To 3
                linea = linea + "*"
            End For
            Display linea
        End For
        Stop
    """),
    "z_factloop_p": program("""
        Start
        Declare Integer n
        Declare Integer resultado
        Input n
        resultado = 0
        For i = 1 To n
            resultado = resultado * i
        End For
        Display resultado
        Stop
    """),
    # ---- the puzzles: real bugs
    "z_report_p": program("""
        Start
        Declare Integer nota
        Declare Integer total
        total = 0
        For i = 1 To 5
            Input nota
            total = total + nota
        End For
        Display total / 6
        Stop
    """),
    "z_tries_p": program("""
        Start
        Declare String clave
        Declare Integer intentos
        intentos = 0
        Do
            Input clave
            intentos = intentos + 1
        Until clave = "abierto" Or intentos = 2
        If clave = "abierto" Then
            Display "dentro"
        Else
            Display "fuera"
        End If
        Stop
    """),
    "z_discount_p": program("""
        Start
        Declare Real total
        Input total
        If total > 100 Then
            total = total * 0.9
        End If
        Display total
        Stop
    """),
    "z_convert_p": program("""
        Start
        Declare Real c
        Input c
        Display c * 9 / 5
        Stop
    """),
    "z_tie_p": program("""
        Start
        Declare Integer rojos
        Declare Integer azules
        Input rojos
        Input azules
        If rojos > azules Then
            Display "Gana el rojo"
        Else
            Display "Gana el azul"
        End If
        Stop
    """),
    "z_fibstep_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        a = 0
        b = 1
        For i = 1 To 5
            Display a
            a = b
            b = a + b
        End For
        Stop
    """),
    "z_coins_p": program("""
        Start
        Declare Integer centavos
        Input centavos
        Display centavos div 100
        Display centavos div 10
        Display centavos mod 10
        Stop
    """),
    "z_score_p": program("""
        Start
        Declare Integer puntos
        puntos = 0
        puntos = puntos + preguntar(4)
        puntos = puntos + preguntar(15)
        Display puntos
        Stop

        Function preguntar(respuesta)
            Declare Integer dicho
            Input dicho
            If dicho = respuesta Then
                Return 0
            Else
                Return 1
            End If
        End Function
    """),
    "z_sent_p": program("""
        Start
        Declare Integer n
        Declare Integer total
        Declare Integer cuantos
        total = 0
        cuantos = 0
        Input n
        While n <> 0
            total = total + n
            cuantos = cuantos + 1
            Input n
        End While
        Display total / (cuantos + 1)
        Stop
    """),
    "z_menu0_p": program("""
        Start
        Declare Integer n
        Display "Elige un número, 0 para parar"
        Input n
        While n <> 1
            Display n
            Display "Elige un número, 0 para parar"
            Input n
        End While
        Display "Adiós"
        Stop
    """),
    # ---- the answers a puzzle is marked against that are words.  A
    # puzzle's tries write them as {out}; each is said here the way the
    # puzzles above say it, so a fixed program says exactly this.
    "zw_in": "dentro",
    "zw_out": "fuera",
    "zw_big": "grande",
    "zw_small": "pequeño",
    "zw_hello": "Hola",
    "zw_hi": "hola",
    "zw_inrange": "dentro del rango",
    "zw_outrange": "fuera del rango",
    "zw_positive": "positivo",
    "zw_zero": "cero",
    "zw_negative": "negativo",
    "zw_go": "ya",
    "zw_ok": "ok",
    "zw_pass": "aprobado",
    "zw_fail": "suspenso",
    "zw_prime": "primo",
    "zw_notprime": "no es primo",
    "zw_open": "abierto",
    "zw_redwins": "Gana el rojo",
    "zw_bluewins": "Gana el azul",
    "zw_tie": "Empate",
    "zw_pick": "Elige un número, 0 para parar",
    "zw_bye": "Adiós",
}

speaks("es", "Español", ES)
