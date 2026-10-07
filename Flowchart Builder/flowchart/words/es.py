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
    "dl_pdf": "Descargar PDF",
    "mm_open": "Texto Mermaid",
    "mm_tip": "El diagrama en Mermaid, para pegarlo en GitHub, Notion o Markdown",
    "mm_head": "Mermaid",
    "mm_bad": "No se pudo leer como diagrama de flujo Mermaid.",
    "mm_opened": "Abierto como dibujo.",
    "print_head": "Imprimir",
    "print_go": "Imprimir…",
    "print_paper": "Papel",
    "print_wide": "Apaisado",
    "print_fit": "Ajustar a una página",
    "print_note": "Se imprime en blanco y negro. Tu navegador pregunta la impresora y el número de copias.",
    "panel_tip": "Mostrar u ocultar el panel",
    "png_tip": "Tamaño del PNG",
    "fit": "Ajustar", "actual": "Real", "zoom_in": "Acercar",
    "slide_left": "Izquierda", "slide_right": "Derecha", "slide_up": "Arriba", "slide_down": "Abajo",
    "hold_locked": "Fijo", "hold_loose": "Libre",
    "lock_tip": "Mantener el diagrama fijo y desplazarse por él",
    "loose_tip": "Arrastra el diagrama a donde quieras; siempre queda una esquina a la vista",
    "tool_move": "Mover",
    "tool_move_tip": "Arrastra para moverte por el papel. Ctrl+arrastrar o Mayús+arrastrar selecciona formas.",
    "tool_select": "Seleccionar",
    "tool_select_tip": "Arrastra sobre el papel para seleccionar formas. Haz clic en formas para añadirlas o quitarlas.",
    "zoom_out": "Alejar", "pixels": "píxeles",
    "dl_scale": "Veces el tamaño dibujado",
    "dl_frame": "Ajustado dentro de una imagen",
    "png_over": "más de lo que este navegador puede dibujar",
    "click_shape": "Haz clic en una forma para dar estilo solo a esa.",
    "palette_hint": "Una paleta colorea todas las formas. Lo que cambies después se conserva.",
    "shapes_hint": "Relleno y contorno, para todas las formas de ese tipo.",
    "apply_all": "Aplicar a las {n} formas: {what}", "clear": "Borrar",
    "rendering": "Generando…",
    "png_big": "Ese PNG es demasiado grande para el navegador. Prueba un tamaño menor o guarda el SVG.",
    "png_fail": "No se pudo crear el PNG. La descarga del SVG sigue funcionando.",
    "png_capped": "{want}× es demasiado para el navegador, así que el PNG se guarda a {got}× ({w} × {h} píxeles).",
    "flowchart": "Diagrama de flujo",
    "r_head": "Ejecutar",
    "r_run": "Ejecutar",
    "r_stop": "Detener",
    "r_code": "Como código", "r_lang_pick": "En qué lenguaje está escrito el código",
    "r_pseudo": "Pseudocódigo",
    "r_slowly": "Paso a paso",
    "r_enter": "Entrar",
    "r_hint": "Ejecuta el programa del diagrama: pide datos, muestra resultados y resalta cada forma. Elige un lenguaje para verlo como código.",
    "r_started": "Ejecutando...",
    "r_done": "Terminado.",
    "r_nothing": "Todavía no hay nada que ejecutar.",
    "r_steps": "{n} pasos, {ms} ms.",
    "r_forever": "Lleva demasiado tiempo sin parar: un bucle nunca termina.",
    "r_zero": "Eso divide entre cero.",
    "r_unknown": "Todavía no se ha puesto nada en {name}.",
    "r_odd_op": "No sé qué hacer con {op}.",
    "r_half": "Esto no se lee como algo completo: {bit}",
    "r_back": "Volver a la ejecución", "back": "Atrás",
    "r_by_hand": "Ejecutar se activa cuando el diseño funcione.",
    "h_no_start": "No hay ninguna forma por la que empezar.",
    "h_tangled": "Estos bucles se cruzan, así que no se puede escribir como programa.",
    "h_not_a_program": "Estas formas no se leen como un programa.",
    "r_build_first": "Construye un diagrama desde pseudocódigo para ejecutarlo aquí.",
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
    "r_no_idea": "No se entiende esta línea, así que la ejecución la saltó.",
    "r_stepped_over": "Se saltaron algunas líneas, así que la salida puede estar incompleta.",
    "r_too_deep": "{name} se ha llamado demasiadas veces y nunca para.",
    "r_args": "{name} pide {want} y le han dado {got}.",
    "r_no_main": "No hay flujo principal, así que la ejecución empezó en {name}.",
    "r_no_item": "Aquí no hay elemento {at}: tiene {n}.",
    "r_no_key": "No hay nada guardado bajo {key}.",
    "r_no_field": "No hay ningún {name} aquí.",
    "r_no_items": "Solo una lista, una palabra o una tabla tiene elementos que sacar, y esto es {what}.",
    "r_whole_at": "Un elemento se elige con un número entero, no con {at}.",
    "r_open_square": "Este [ se abre y nunca se cierra.",
    "r_empty_list": "La lista está vacía, así que no hay nada que sacar.",
    "r_not_in_list": "{item} no está en la lista.",
    "r_needs_list": "{name} necesita una lista.",
    "w_head": "Merece un vistazo",
    "w_found": "{n} para mirar en el pseudocódigo:",
    "w_open_if": "Línea {line}: este If no se cierra nunca. Añade un End If donde deba terminar.",
    "w_open_loop": "Línea {line}: este bucle no se cierra nunca. Añade un End While donde deba terminar.",
    "w_open_for": "Línea {line}: este For nunca se cierra. Añade un End For donde deba terminar.",
    "w_open_select": "Línea {line}: este Select no se cierra nunca. Añade un End Select donde deba terminar.",
    "w_no_if": "Línea {line}: End If, pero no hay ningún If abierto.",
    "w_no_loop": "Línea {line}: esto cierra un bucle, pero no hay ningún bucle abierto.",
    "w_exit_alone": "Línea {line}: Exit sale de un bucle, pero aquí no hay ninguno abierto.",
    "w_no_select": "Línea {line}: End Select, pero no hay ningún Select abierto.",
    "w_do_no_test": "Línea {line}: este Do no tiene condición y nunca para. Ciérralo con Until ... o Loop While ...",
    "w_until_alone": "Línea {line}: Until, pero no hay ningún Do ni Repeat encima.",
    "w_mend_change": "Cambiar {word} por {instead}",
    "w_mend_drop": "Quitar la línea {line}",
    "w_mend_insert": "Poner {text} en la línea {line}",
    "w_mend_tip": "Doble clic para arreglarlo",
    "w_mend_close": "Poner el {text} que falta al final",
    "w_mend_cut": "Quitar {text}",
    "w_mend_put": "Poner {text}",
    "w_mend_all": "Arreglar los {n}",
    "ask_go": "Ponerlo",
    "ask_tip": "Escribe lo que falta en el cuadro de abajo",
    "ask_pick": "Elige una forma",
    "ask_join": "Unirlas",
    "ask_start": "Empezar {name} en",
    "ask_input": "Pedirlo al ejecutar",
    "ask_forever": "El bucle de la línea {line} nunca se detiene. Añadir al final",
    "ask_stop_when": "O detenerlo cuando",
    "ask_zero_else": "Si {name} es 0, usar en su lugar",
    "ask_zero_show": "Si {name} es 0, mostrar en su lugar",
    "ask_zero_eg": "No hay entre qué dividir",
    "ask_zero_skip": "Saltarlo si {name} es 0",
    "ask_args": "{name} también necesita {what}",
    "ask_args_cut": "Quitar los {n} de más",
    "ask_deep": "{name} necesita un final: parar cuando",
    "ask_deep_give": "y devolver",
    "ask_use": "No existe {name}. Usar en su lugar",
    "ask_here": "¿Qué va aquí?",
    "ask_line": "Escribir la línea {line} así",
    "ask_until": "Seguir dando vueltas hasta",
    "ask_close": "{text} va después de la línea",
    "ask_same": "La línea ya está así. Cámbiala primero.",
    "ask_stale": "El pseudocódigo ha cambiado desde entonces. Vuelve a construirlo primero.",
    "ask_bad_empty": "Escribe algo primero.",
    "ask_bad_pick": "Elige uno primero.",
    "ask_bad_open": "Hay un {text} que nunca se cierra.",
    "ask_bad_shut": "Hay un {text} que no cierra nada.",
    "ask_bad_name": "Tiene que ser un solo nombre, como total.",
    "ask_bad_line": "Elige una línea de {from} a {to}.",
    "ask_write_in": "Escribir dentro",
    "ask_write_eg": "total = total + 1",
    "ask_arrow_to": "Flecha desde aquí hasta",
    "ask_arrow_from": "Flecha hasta aquí desde",
    "ask_name_way": "Palabras para esta salida",
    "ask_leave_when": "Salir del bucle cuando",
    "ask_end_after": "Poner un Fin después de",
    "ask_arrow_into": "Flecha hasta «{name}» desde",
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
    "f_open": "Abrir un archivo",
    "f_not_ours": "Ese archivo JSON no es un diseño guardado desde aquí.",
    "f_opened": "Se abrió {name}.",
    "f_empty": "Ese no tiene nada escrito.",
    "f_open_tip": "Código, pseudocódigo, un diagrama de flujo de draw.io, Lucidchart, Visio o Excalidraw, o una imagen de uno. También puedes soltar archivos en la página o pegar una imagen.",
    "f_folder": "Abrir una carpeta",
    "f_folder_tip": "Una carpeta de código, pseudocódigo o diagramas de flujo. También sirve un zip.",
    "in_head": "Qué abrir",
    "in_from": "En {name}",
    "in_cancel": "Cancelar",
    "in_all": "Los {n}, como un solo programa",
    "in_files": "{n} archivos",
    "in_skipped": "Se dejaron fuera otros {n} archivos.",
    "in_skipped_one": "Se dejó fuera otro archivo.",
    "in_paste_head": "Abrir la imagen pegada",
    "in_paste_said": "Se convierte en un diagrama de flujo nuevo, en lugar de lo que hay ahora.",
    "in_paste_yes": "Abrirla",
    "in_nothing": "Ahí no hay código, pseudocódigo ni diagramas de flujo.",
    "in_cannot": "Aquí no se puede abrir ese tipo de archivo.",
    "in_unread": "No se pudo leer como diagrama de flujo.",
    "in_many": "Se abrieron los primeros {n} archivos.",
    "in_most": "Leídos los {n} archivos más importantes de {all}. Todos los archivos están en la lista sobre el código.",
    "in_reading": "Leyendo {n} de {of} archivos…",
    "in_sorting": "Ordenando {n} archivos…",
    "in_found": "Encontrados {n} archivos…",
    "in_more_items": "…y {n} más.",
    "in_old": "Este navegador no puede descomprimir eso. Prueba uno más reciente.",
    "in_looking": "Abriendo…",
    "in_again": "Otro de {name}",
    "in_again_plain": "Abrir otro de esos",
    "in_picture": "Imagen",
    "in_design": "Guardado aquí",
    "in_drop": "Suelta para abrir",
    "in_drop_more": "Código, pseudocódigo, un diagrama de flujo, una imagen de uno, una carpeta o un zip",
    "pic_looking": "Mirando la imagen…",
    "pic_words": "Leyendo las palabras, {n} de {m}…",
    "pic_labels": "Leyendo las palabras de las flechas…",
    "pic_read": "Se leyó {name}. Revisa las palabras.",
    "pic_unread": "Se leyeron las formas de {name}. Escribe las palabras: para leerlas hace falta conexión.",
    "pic_none": "No se encontró ningún diagrama de flujo en esa imagen.",
    "pic_bad": "No se pudo abrir esa imagen.",
    "dl_copy": "Copiar el diagrama",
    "dl_copied": "Copiado",
    "dl_copy_no": "Este navegador no puede copiar imágenes. Descárgala en su lugar.",
    "l_copy": "Copiar un enlace a esto",
    "l_copied": "Enlace copiado",
    "l_copy_no": "No se pudo copiar. Tómalo de la barra de direcciones.",
    "fd_head": "Dónde se guarda",
    "fd_browser": "En las descargas de tu navegador.",
    "fd_in": "En la carpeta {name}.",
    "fd_pick": "Elegir una carpeta",
    "fd_pick_tip": "Elige o crea una carpeta. Todo lo que guardes irá directamente a ella.",
    "fd_off": "Volver a las descargas",
    "fd_cannot": "Este navegador solo guarda en Descargas. Chrome o Edge en una computadora pueden elegir una carpeta.",
    "fd_saved": "{name} guardado en {folder}",
    "fd_fell": "{folder} no lo aceptó, así que fue a Descargas.",
    "l_opened": "Abierto desde un enlace.",
    "l_long": "Este enlace tiene {n} caracteres. El correo y los chats pueden cortarlo: mejor envía el archivo.",
    "l_bad": "Ese enlace no lleva ningún diagrama que esta página pueda leer.",
    "sv_tab": "Progreso guardado",
    "sv_about": "Guarda el diagrama, la ejecución y dónde iba, en este navegador. Hay sitio para {n}.",
    "sv_save": "Guardar el progreso",
    "sv_saved": "Guardado.",
    "sv_full": "Los {n} están ocupados. Guarda encima de uno o borra uno.",
    "sv_nothing": "Todavía no hay nada que guardar.",
    "sv_no_room": "El navegador no lo guardó: el almacenamiento está lleno o desactivado.",
    "sv_empty": "Vacío",
    "sv_load": "Cargar",
    "sv_over": "Guardar encima",
    "sv_over_ask": "¿Reemplazar este guardado por lo que hay en la página?",
    "sv_over_yes": "Guardar encima",
    "sv_del_ask": "¿Borrar este guardado para siempre?",
    "sv_today": "Hoy",
    "sv_st_none": "Sin ejecutar",
    "sv_st_ask": "Esperando una respuesta",
    "sv_st_next": "Esperando el siguiente paso",
    "sv_st_going": "A mitad de una ejecución",
    "sv_st_over": "Ejecución terminada",
    "sv_back": "Sigue donde lo dejaste.",
    "sv_moved": "Este guardado ya no coincide con el programa, así que no se pudo retomar.",
    "sv_lost": "No se pudo leer el programa de este guardado desde el "
               "almacenamiento del navegador.",
    "sv_no_draw": "El diagrama no se dibujó, así que la ejecución no pudo "
                  "retomarse.",
    "sv_stop_said": "Cargar un guardado sustituye al programa en marcha, así que la ejecución se detendrá.",
    "sv_stop_yes": "Detener y cargar",
    "held_head": "Lo que tiene guardado",
    "held_in": "en {name}",
    "held_shared": "Declarado fuera de todo módulo, así que lo ve cada diagrama",
    "held_none": "nada todavía",
    "held_switch": "Mostrar lo que tiene guardado",
    "tests_open": "Casos de prueba",
    "tests_tip": "Comprobarlo con las entradas que elijas y la salida que debe dar",
    "tests_head": "Casos de prueba",
    "tests_one": "Prueba {n}",
    "tests_typed": "Entrada, una por línea",
    "tests_want": "Salida esperada, una por línea",
    "tests_add": "Añadir una prueba",
    "tests_run": "Ejecutar las pruebas",
    "tests_drop": "Quitar",
    "tests_pass": "Superada",
    "tests_fail": "Fallida",
    "tests_all": "{pass} de {n} superadas",
    "tests_none": "Escribe primero una prueba.",
    "tests_diff": "Línea {n}: mostró «{got}», no «{want}».",
    "tests_short": "Mostró {n} líneas, no {m}.",
    "tests_long": "Mostró {n} líneas, no {m}.",
    "tests_broke": "Se detuvo con un error.",
    "trace_open": "Tabla de traza",
    "trace_tip": "Cada cambio de la ejecución, paso a paso, en una tabla",
    "trace_head": "Tabla de traza",
    "trace_line": "Línea",
    "trace_out": "Salida",
    "trace_main": "Programa principal",
    "trace_none": "Ejecuta el programa y la tabla se irá llenando.",
    "trace_rows": "{n} pasos",
    "trace_cut": "solo se guardan los primeros {n}",
    "bp_add": "Pausar aquí",
    "bp_drop": "No pausar aquí",
    "bp_clear": "Quitar todas las pausas",
    "r_paused": "En pausa en la línea {n}.",
    "r_paused_hand": "En pausa.",
    "h_tidy": "Ordenar",
    "h_tidy_tip": "Ordenar formas y flechas como se dibuja un diagrama desde pseudocódigo",
    "h_tidied": "Ordenado: {n} figuras movidas.",
    "h_tidy_none": "Todavía no hay nada que ordenar.",
    "h_tidy_done": "Ya está ordenado.",
    "h_write": "Como texto",
    "h_write_tip": "Ver el pseudocódigo de este dibujo",
    "h_into_box": "Ponerlo en el cuadro",
    "h_into_box_tip": "Poner esto en el cuadro de pseudocódigo, reemplazando lo que haya. El dibujo se queda.",
    "s_no": "Déjalo",
    "s_stop_head": "Todavía se está ejecutando",
    "s_stop_said": "Un diagrama nuevo reemplaza el programa en marcha, así que la ejecución se detendrá.",
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
    "shapes_for_hint": "Qué forma tiene cada tipo de paso. Lo que hace el paso no cambia.",
    "size": "Tamaño",
    "width": "Ancho",
    "height": "Alto",
    "turn": "Girar",
    "fit_words": "Ajustar al texto",
    "colors_here": "Colores",
    "odd_shape": "No se puede dibujar {pair}; mira --help.",
    "mode_code": "Texto",
    "mode_hand": "Dibujo",
    "mode_lang": "Código",
    # ---- un programa contado con palabras, y el pseudocódigo que sale de él
    "told_head": "Pseudocódigo actualizado",
    "told_tip": "Tus palabras leídas como pseudocódigo. El diagrama sale de aquí.",
    "told_yours": "Lo que escribiste",
    # ---- el programa en un lenguaje, leído de vuelta como pseudocódigo
    "lang_head": "Tu código",
    "lang_pick": "El lenguaje: se reconoce en el código, o elige uno",
    "lang_auto": "Reconocer el lenguaje",
    "lang_auto_is": "Reconocido: {lang}",
    "lang_file_add": "Añadir un archivo",
    "lang_file_tip": "Doble clic para renombrar",
    "lang_file_drop": "Quitar este archivo",
    "lang_top": "Lo más importante · {n} de {all}",
    "lang_more": "+{n} más",
    "lang_more_tip": "Todos los archivos, para buscar y abrir",
    "lang_less": "Ocultar la lista",
    "lang_find": "Buscar un archivo",
    "lang_count": "{n} archivos",
    "lang_list_read": "Se leen al construir · {n}",
    "lang_list_rest": "También en la carpeta · {n}",
    "lang_list_none": "Ningún archivo tiene eso en su nombre o carpeta.",
    "lang_list_bring": "Lo abre y lo lee con los demás al construir",
    "lang_drop_ask": "¿Quitar {name}?",
    "lang_drop_said": "Su código se va con él.",
    "lang_place": "Escribe o pega un programa en Python, Java, C#, C++, JavaScript, TypeScript, C, Kotlin, Swift, Go o Rust y pulsa Dibujar.",
    "lang_stale": "El pseudocódigo ha cambiado desde entonces.",
    "lang_rewrite": "Reescribir en {lang}",
    "lang_rewrite_tip": "Sustituye el código por el pseudocódigo escrito en {lang}",
    "lang_made": "Hecho a partir de tu código. Edítalo en Texto.",
    "lang_line": "Línea {n}: {said}",
    "lang_check": "Comprobar",
    "lang_check_tip": "Leer el código y decir si algo está mal",
    "lang_fix": "Poner {what}",
    "lang_fix_at": "Poner {what} en la línea {line}",
    "lang_fix_many": "Poner los {n} {what} que faltan",
    "lang_fix_tip": "Ctrl+Z lo vuelve a quitar",
    "lang_fix_cut": "Quitar {what}",
    "lang_fix_cut_at": "Quitar {what} en la línea {line}",
    "lang_fix_change": "Cambiar {word} por {instead}",
    "lang_fix_change_at": "Cambiar {word} por {instead} en la línea {line}",
    "lang_fix_indent": "Alinear la línea {line}",
    "lang_fix_call": "Convertirlo en {name}(…)",
    "lang_fix_split": "Poner el resto de la línea en una línea propia",
    "lang_fix_split_at": "Poner el resto de la línea {line} en una línea propia",
    "lang_fixing": "Arreglando errores y problemas",
    "lang_fixed_one": "1 error arreglado",
    "lang_fixed_many": "{n} errores arreglados",
    "lang_fixed_tip": "Ver qué estaba mal y qué se hizo",
    "lang_fixed_undo": "Dejarlo como estaba",
    "lang_reading": "Leyendo el código",
    "lang_finding": "Buscando errores y problemas",
    "lang_listing": "Listando lo que queda",
    "lang_too_big": "Este error es demasiado grande para arreglarlo. Esto es todo lo que hay que revisar:",
    "lang_left_one": "1 problema no se pudo arreglar:",
    "lang_left_many": "{n} problemas no se pudieron arreglar:",
    "lang_list_more": "…y más, que no se muestran aquí.",
    "lang_put_found": "Arreglar de todos modos los {n} que encontró",
    "cm_empty": "Escribe algo de código primero.",
    "cm_expected": "se esperaba {what} aquí.",
    "cm_ended": "el código termina antes de estar completo.",
    "cm_odd": "no se esperaba {bit} aquí.",
    "cm_indent": "la sangría no cuadra.",
    "cm_open": "una comilla o un comentario nunca se cierra.",
    "cm_lists": "listas así aún no se pueden dibujar.",
    "cm_class": "las clases y los objetos no se pueden dibujar.",
    "cm_lambda": "una función sin nombre no se puede dibujar.",
    "cm_nested_fn": "una función dentro de otra no se puede dibujar.",
    "cm_break": "break solo funciona al principio o al final de un bucle.",
    "cm_continue": "continue no se puede dibujar.",
    "cm_input_where": "guarda primero lo que se escribe en una variable.",
    "cm_twice": "{name} está definida dos veces.",
    "cm_other": "{bit} no se puede dibujar.",
    "cm_wont_run": "Línea {n}: {bit} se dibuja, pero no se puede ejecutar.",
    "cm_if_wrong": "Si aquí ocurre {what}, el código hace esto en su lugar:",
    "cm_an_error": "un error",
    "add_shape": "Añadir una forma",
    "hand_hint": "Arrastra las formas. Haz clic en una, luego en Conectar y después en la siguiente.",
    "words_in": "Texto de la forma",
    "connect": "Conectar",
    "connect_now": "Ahora haz clic en la forma a la que va.",
    "goes_to": "Va a",
    "nothing_yet": "nada todavía",
    "delete": "Eliminar",
    "check": "Comprobar el diseño",
    "checked_good": "No se encontraron problemas.",
    "problems": "{n} cosas que revisar",
    "problems_more": "y {n} más",
    "h_too_many": "Demasiadas formas (máximo {n})",
    "h_info": "Cómo dibujar",
    "h_add_how": "Haz clic en una forma para añadirla debajo de la actual, o arrástrala al papel. Básicas, Flujo, Datos y Otras tienen más formas.",
    "h_mouse": "Ratón y pantalla táctil",
    "h_keys": "Teclas",
    "h_all_keys": "Todos los atajos de teclado",
    "hm_pick": "Elegir una forma o una flecha",
    "hm_move": "Mover una forma, o todas las seleccionadas",
    "hm_size": "Agrandar o reducir la forma elegida",
    "hm_turn": "Girar la forma elegida a cualquier ángulo (Mayús: de 15° en 15°)",
    "hm_join": "Trazar una flecha hacia otra forma",
    "hm_type": "Escribir en una forma o sobre una flecha",
    "hm_menu": "Ver todo lo que puedes hacer con ella",
    "hm_zoom": "Acercar o alejar",
    "hm_rule": "Usar la forma que sugieren las reglas, o dejar esta (marca ámbar)",
    "hm_select": "Elige Seleccionar abajo y arrastra sobre el papel para seleccionar formas, también con el dedo.",
    "many_head": "{n} formas seleccionadas",
    "as_chart": "Diagrama",
    "untitled": "Sin título",
    "p_no_start": "Nada inicia el flujo: todas las formas tienen una flecha de entrada.",
    "p_many_starts": "{n} formas no tienen entrada. Un diagrama empieza en un solo sitio.",
    "p_start_kind": "La primera forma debería ser de Inicio / Fin ({shape}).",
    "p_no_end": "No hay Fin ({shape}) donde el flujo se detenga.",
    "p_unreached": "Nada lleva a esta forma.",
    "p_dead_end": "No sale nada de esta forma y no es un Fin.",
    "p_decision_out": "Una decisión necesita al menos dos salidas. Esta tiene {n}.",
    "p_one_out": "Esta forma tiene {n} salidas. Solo una decisión puede tener dos.",
    "p_same_labels": "Dos salidas dicen lo mismo.",
    "p_no_label": "Cada salida de una decisión necesita etiqueta.",
    "p_trapped": "Desde aquí el flujo nunca llega a un Fin.",
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
    "hf_join": "Unirla desde la forma de arriba",
    "hf_join_all": "Unirlas desde las formas de arriba",
    "hf_out": "Dibujar su otra salida",
    "hf_decide": "Convertirla en decisión",
    "hf_drop_way": "Quitar las flechas de más",
    "hf_name_way": "Escribir en la flecha",
    "hp_next": "Añadir el paso siguiente",
    "hp_what_next": "¿Qué viene después?",
    "hp_into": "Meter un paso en ella",
    "m_colors": "Colores", "m_format": "Formato de forma…", "m_more_shapes": "Más formas",
    "sg_basic": "Básicas", "sg_flow": "Flujo", "sg_data": "Datos", "sg_other": "Otras",
    "hr_head": "Reglas de formas",
    "hr_says": "Esto parece «{role}». Las reglas de formas usan para eso: {shape}.",
    "hr_change": "Cambiar a {shape}",
    "hr_keep": "Dejarla así",
    "rs_card": "Restablecer valores predeterminados",
    "rd_tip": "Color cambiado para que se pueda leer",
    "rd_head": "Más fácil de leer",
    "rd_keep": "Mantener este color",
    "rd_ignore": "Ignorar",
    "rd_words_dark": "Texto más oscuro para que resalte.",
    "rd_words_light": "Texto más claro para que resalte.",
    "rd_edge_dark": "Borde más oscuro para que se vea en el papel.",
    "rd_edge_light": "Borde más claro para que se vea en el papel.",
    "rd_lines_dark": "Flechas más oscuras para que se vean en el papel.",
    "rd_lines_light": "Flechas más claras para que se vean en el papel.",
    "rd_said_dark": "Texto de las flechas más oscuro para que se vea en el papel.",
    "rd_said_light": "Texto de las flechas más claro para que se vea en el papel.",
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
    "mv_said": "Volver a construir rehace el diseño y los bloques movidos vuelven a su sitio. Deshacer puede recuperarlos.",
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
    "games": "Juegos",
    "games_tip": "Juegos para jugar y para ver como diagrama de flujo mientras juegas",
    "gm_head": "Juegos",
    "gm_small": "Juegos rápidos",
    "gm_big": "Juegos grandes",
    "gm_charts": "Diagramas",
    "gm_many": "Varios",
    "gm_one": "Uno solo",
    "gm_many_tip": "Cada módulo y cada función es un diagrama propio, al lado del principal",
    "gm_one_tip": "Cada módulo y cada función se dibuja donde se llama, así el juego es un solo diagrama de flujo",
    "gm_size": "{n} líneas · {charts}",
    "gm_charts_n": "{n} diagramas",
    "gm_chart_one": "un diagrama",
    "gm_how": "Cómo se juega",
    "gm_play": "Jugar",
    "gm_play_tip": "Ejecutarlo todo de una vez, para jugar",
    "gm_all": "Todos los juegos",
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
    "e_factorial": "Un factorial",
    "try_short": "¿Primera vez?",
    "try_go": "Probar un ejemplo",
    "e_sumevens": "Sumar los pares",
    "e_vowel": "Vocal o no",
    "e_leap": "Año bisiesto",
    "eg_l4": "Programas del día a día",
    "eg_l5": "Proyectos más grandes",
    "e_bank": "Una cuenta bancaria",
    "e_gradebook": "Un registro de notas",
    "e_paycheck": "Nóminas semanales",
    "e_vending": "Una máquina expendedora",
    "e_primelist": "Primos hasta un límite",
    "e_weekday": "¿Qué día de la semana?",
    "e_loan": "Pagar un préstamo",
    "e_rps": "Piedra, papel o tijera",
    "e_library": "Préstamos de biblioteca",
    "e_inventory": "Inventario de la tienda",
    "e_tictactoe": "Tres en raya",
    "e_weather": "Dos semanas de tiempo",
    "e_sortsearch": "Ordenar y buscar notas",
    "e_hailstone": "Números de granizo",
    "e_rainfall": "La lluvia mes a mes",
    "e_savings": "Ahorros año a año",
    "e_classlist": "Una lista de clase con registros",
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
    "eg_head": "Ejemplos",
    "eg_lines": "{n} líneas",
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
    "o_onechart": "Módulos y funciones en un solo diagrama",
    "o_roomy": "Amplio: más espacio en cada paso",
    "o_tight": "Compacto: menos figuras, bien juntas",
    "o_columns": "Dividir un diagrama alto en columnas",
    "o_steady": "El mismo dibujo siempre",
    "o_space": "Espaciado", "o_space_tight": "Compacto",
    "o_space_plain": "Normal", "o_space_roomy": "Amplio",
    "tidy_head": "Opciones de ordenar", "t_layout": "Disposición", "t_shapes": "Formas",
    "t_place": "En el papel",
    "t_arrows": "Largo de las flechas", "t_arrows_sub": "En cuadros, como mínimo",
    "t_turns": "Mantener el giro", "t_fit": "Ajustar las formas a sus palabras",
    "t_even": "Mismo ancho para todas", "t_keep": "Mantener",
    "t_stay": "Dejar el diagrama donde está",
    "more": "Opciones", "more_tip": "Más opciones del diagrama",
    "decide": "Decisiones",
    "undo": "Deshacer", "redo": "Rehacer",
    "settings": "Ajustes", "appearance": "Apariencia", "panel_side": "Lado del panel",
    "side_left": "Izquierda", "side_right": "Derecha", "full_screen": "Pantalla completa",
    "full_on": "Llenar la pantalla", "full_off": "Salir de pantalla completa",
    "no_full": "Este navegador no admite pantalla completa.",
    "app_install": "Instalar como app",
    "wipe_head": "Empezar de nuevo",
    "wipe_hint": "Borra todo en esta página, para empezar de cero.",
    "wipe_open": "Borrar todo…",
    "wipe_title1": "¿Borrar todo?",
    "wipe_said": "Esto quita todo lo que has hecho aquí:",
    "wipe_l_work": "el pseudocódigo, el diagrama y sus pruebas",
    "wipe_l_hand": "el dibujo hecho a mano",
    "wipe_l_code": "el código y todos sus archivos",
    "wipe_l_run": "la ejecución, lo que mostró y su tabla de seguimiento",
    "wipe_saves": "También el progreso guardado y los acertijos resueltos",
    "wipe_settings": "También los colores, las formas y los ajustes",
    "wipe_keep": "Conservar mi trabajo",
    "wipe_next": "Continuar…",
    "wipe_title2": "¿Guardarlo antes?",
    "wipe_save_q": "¿Quieres guardar tu trabajo antes de borrarlo?",
    "wipe_save_said": "Una copia guardada como archivo se vuelve a abrir con Archivos, Abrir un archivo.",
    "wipe_save": "Guardar una copia antes",
    "wipe_saved": "Copia guardada como {name}.",
    "wipe_type": "Para borrar todo, escribe {word} abajo. No se puede deshacer.",
    "wipe_word": "BORRAR",
    "wipe_back": "Volver",
    "wipe_go": "Borrar todo",
    "wipe_going": "Borrando…",
    "keep_save": "Guardar el progreso antes",
    "keep_saved": "Guardado en Progreso guardado, lugar {n}.",
    "keep_saved_file": "El progreso guardado está lleno, así que se guardó una copia como archivo.",
    "open_head": "¿Abrir esto en lugar de tu trabajo?",
    "open_said": "Hay trabajo en la página. Abrir esto lo pone en su lugar.",
    "open_no": "Cancelar",
    "open_yes": "Abrirlo",
    "sync_head_code": "¿Reemplazar el pseudocódigo?",
    "sync_head_hand": "¿Reemplazar el dibujo?",
    "sync_head_lang": "¿Reemplazar el código?",
    "sync_code_from_hand": "El pseudocódigo tiene cambios propios, y el dibujo ha cambiado desde entonces. Si sigues, se escribe el programa del dibujo en lugar del pseudocódigo.",
    "sync_code_from_lang": "El pseudocódigo tiene cambios propios, y el código ha cambiado desde entonces. Si sigues, se lee el código en el pseudocódigo en su lugar.",
    "sync_hand_from_code": "El dibujo tiene cambios propios, y el pseudocódigo ha cambiado desde entonces. Si sigues, se dibuja el programa del pseudocódigo en lugar del dibujo.",
    "sync_lang_from_code": "El código de aquí es tuyo, y el pseudocódigo ha cambiado desde entonces. Si sigues, se escribe el programa del pseudocódigo como código en su lugar.",
    "sync_keep": "Conservar este",
    "sync_go": "Reemplazarlo",
    "sync_unfinished": "El dibujo aún no es un programa completo, así que el pseudocódigo se dejó como estaba.",
    "app_tip": "Se abre en su propia ventana, como una app, y funciona sin conexión",
    "app_ios": "Toca Compartir y luego Añadir a la pantalla de inicio.",
    "app_mac": "En Safari, abre el menú Archivo y elige Añadir al Dock.",
    "app_done": "Instalada. También funciona sin conexión.",
    "p_ink": "Tinta", "p_classic": "Clásica", "p_slate": "Pizarra",
    "p_meadow": "Pradera", "p_sunset": "Ocaso", "p_night": "Noche", "p_lavender": "Lavanda",
    "p_charcoal": "Carbón", "p_ember": "Brasa",
    "pseudocode": "Pseudocódigo", "title": "Título",
    "code_big": "Llenar la pantalla", "code_small": "Volver al panel", "done": "Listo",
    "code_lines": "{n} líneas",
    "code_ask": "Introduce {name}: ",
    "code_shares": "lo que comparte el programa",
    "c_head": "Exportar código", "c_write": "Escribir el código",
    "tr_pick": "El lenguaje al que se traduce tu código",
    # (its own words: tr_head is the ground's, 40-land.js, 2026-10-03)
    "tl_head": "Traducir el código", "tl_go": "Traducir",
    "c_one": "En un solo archivo", "c_apart": "Varios archivos",
    "c_files_tip": "Un archivo, o uno por diagrama. Un diagrama largo de un solo flujo se divide.",
    "c_one_chart": "Demasiado corto para dividirlo: un solo archivo.",
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
    "k_hand": "Dibujando",
    "k_lang": "Escribiendo código",
    "k_build": "Dibujar el diagrama (Dibujo: comprobarlo)",
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
    "kn_spin": "arrastrar el asa redonda",
    "kn_plus": "clic en +",
    "b_about": "Cuánto le falta al dibujo",
    "b_boot": "Iniciando Python en el navegador",
    "b_read": "Leyendo el pseudocódigo",
    "b_lay": "Colocando las formas",
    "b_draw": "Dibujando el diagrama",
    "b_page": "Poniéndolo en la página",
    "ready": "Listo.",
    "boot_failed": "Python no pudo iniciarse en este navegador ({err}).",
    "py_gave_out": "Python se detuvo a mitad de este dibujo ({err}).",
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
    "e_hailstone_p": program("""
        Start
        Declare Integer n
        Declare Integer pasos
        Display "¿Desde qué número empezamos?"
        Input n
        pasos = 0
        While n <> 1
            If n mod 2 = 0 Then
                n = n div 2
            Else
                n = 3 * n + 1
            End If
            pasos = pasos + 1
            Display n
        End While
        Display "Pasos hasta llegar a 1: ", pasos
        Stop
    """),
    "e_rainfall_p": program("""
        Start
        Declare Real total
        Declare String masLluvioso
        lluvia = {"Ene": 78, "Feb": 52, "Mar": 61, "Abr": 45, "May": 30, "Jun": 12}
        Display "Lluvia en mm: ", lluvia
        total = 0
        masLluvioso = "Ene"
        For Each mes In lluvia
            total = total + lluvia[mes]
            If lluvia[mes] > lluvia[masLluvioso] Then
                masLluvioso = mes
            End If
        End For
        Display "Media: ", round(total / length(lluvia), 1), " mm"
        Display "El mes más lluvioso: ", masLluvioso
        Stop
    """),
    "e_savings_p": program("""
        Start
        Declare Real inicio
        Declare Real interes
        Declare Integer anios
        Declare Real saldo
        Display "¿Con cuánto empiezas?"
        Input inicio
        Display "¿Tipo de interés, en porcentaje?"
        Input interes
        Display "¿Durante cuántos años?"
        Input anios
        saldo = inicio
        For anio = 1 To anios
            saldo = crecer(saldo, interes)
            Display "Año ", anio, ": ", round(saldo, 2)
        End For
        Display "Ganancia: ", round(saldo - inicio, 2)
        Display "Años hasta duplicarlo: ", aniosParaDuplicar(inicio, interes)
        Stop

        Function crecer(cantidad, porcentaje)
            Return cantidad + cantidad * porcentaje / 100
        End Function

        Function aniosParaDuplicar(cantidad, porcentaje)
            Declare Integer cuenta
            Declare Real ahora
            If porcentaje <= 0 Then
                Return 0
            End If
            cuenta = 0
            ahora = cantidad
            While ahora < cantidad * 2
                ahora = crecer(ahora, porcentaje)
                cuenta = cuenta + 1
            End While
            Return cuenta
        End Function
    """),
    "e_classlist_p": program("""
        Start
        Declare Integer i
        Declare Real total
        nombres = ["Ana", "Ben", "Cy", "Dee", "Eli", "Fay"]
        notas = [88, 72, 95, 64, 79, 91]
        alumnos = []
        For i = 0 To length(nombres) - 1
            Call append(alumnos, nuevoAlumno(nombres[i], notas[i]))
        End For
        total = 0
        mejor = alumnos[0]
        For Each a In alumnos
            Display a.nombre, ": ", a.nota
            total = total + a.nota
            If a.nota > mejor.nota Then
                mejor = a
            End If
        End For
        Display "Media de la clase: ", round(total / length(alumnos), 1)
        Display "El mejor de la clase: ", mejor.nombre
        Stop

        Function nuevoAlumno(nombre, nota)
            uno = New Alumno
            uno.nombre = nombre
            uno.nota = nota
            Return uno
        End Function
    """),
    "e_library_p": program("""
        Start
        Declare Integer opcion
        Declare Integer pos
        Declare String titulo
        estante = []
        Call append(estante, nuevoLibro("La telaraña de Carlota", "E. B. White"))
        Call append(estante, nuevoLibro("El hacha", "Gary Paulsen"))
        Call append(estante, nuevoLibro("Hoyos", "Louis Sachar"))
        Call append(estante, nuevoLibro("La lección de August", "R. J. Palacio"))
        Do
            Display "1 ver libros  2 pedir prestado  3 devolver  4 salir"
            Input opcion
            Select Case opcion
                Case 1
                    Call mostrarLibros(estante)
                Case 2
                    Display "¿Qué título quieres?"
                    Input titulo
                    pos = buscarLibro(estante, titulo)
                    If pos = -1 Then
                        Display "No hay ningún libro llamado ", titulo
                    Else If estante[pos].prestado Then
                        Display titulo, " ya está prestado"
                    Else
                        estante[pos].prestado = True
                        Display "Te llevas ", estante[pos].titulo
                    End If
                Case 3
                    Display "¿Qué título devuelves?"
                    Input titulo
                    pos = buscarLibro(estante, titulo)
                    If pos = -1 Then
                        Display "Ese libro no es de esta biblioteca"
                    Else If Not estante[pos].prestado Then
                        Display estante[pos].titulo, " no estaba prestado"
                    Else
                        estante[pos].prestado = False
                        Display "Gracias por devolver ", estante[pos].titulo
                    End If
                Case 4
                    Display "Adiós"
                Case Else
                    Display "Elige 1, 2, 3 o 4"
            End Select
        Until opcion = 4
        Display "Libros todavía prestados: ", contarPrestados(estante)
        Stop

        Function nuevoLibro(titulo, autor)
            uno = New Libro
            uno.titulo = titulo
            uno.autor = autor
            uno.prestado = False
            Return uno
        End Function

        Function Integer buscarLibro(libros, titulo)
            For i = 0 To length(libros) - 1
                If toLower(libros[i].titulo) = toLower(titulo) Then
                    Return i
                End If
            End For
            Return -1
        End Function

        Module mostrarLibros(libros)
            For Each l In libros
                If l.prestado Then
                    Display l.titulo, " de ", l.autor, " (prestado)"
                Else
                    Display l.titulo, " de ", l.autor, " (en el estante)"
                End If
            End For
        End Module

        Function Integer contarPrestados(libros)
            Declare Integer n
            n = 0
            For Each l In libros
                If l.prestado Then
                    n = n + 1
                End If
            End For
            Return n
        End Function
    """),
    "e_inventory_p": program("""
        Start
        Declare Integer opcion
        Declare Integer cantidad
        Declare String articulo
        existencias = {"manzanas": 40, "pan": 12, "leche": 6, "huevos": 30}
        precios = {"manzanas": 0.5, "pan": 2.25, "leche": 3.1, "huevos": 0.3}
        Do
            Display "1 ver existencias  2 vender  3 reponer  4 salir"
            Input opcion
            Select Case opcion
                Case 1
                    Call mostrarExistencias(existencias, precios)
                Case 2
                    Display "¿Qué artículo vendes?"
                    Input articulo
                    If Not hayArticulo(existencias, articulo) Then
                        Display "No vendemos ", articulo
                    Else
                        Display "¿Cuántos?"
                        Input cantidad
                        If cantidad <= 0 Then
                            Display "Vende al menos uno"
                        Else If cantidad > existencias[articulo] Then
                            Display "Solo quedan ", existencias[articulo]
                        Else
                            existencias[articulo] = existencias[articulo] - cantidad
                            Display "Vendidos ", cantidad, " de ", articulo, " por $", round(cantidad * precios[articulo], 2)
                        End If
                    End If
                Case 3
                    Display "¿Qué artículo repones?"
                    Input articulo
                    If Not hayArticulo(existencias, articulo) Then
                        Display "No vendemos ", articulo
                    Else
                        Display "¿Cuántos llegaron?"
                        Input cantidad
                        If cantidad <= 0 Then
                            Display "Un pedido trae al menos uno"
                        Else
                            existencias[articulo] = existencias[articulo] + cantidad
                            Display "Ahora hay ", existencias[articulo], " de ", articulo
                        End If
                    End If
                Case 4
                    Display "Cerramos"
                Case Else
                    Display "Elige 1, 2, 3 o 4"
            End Select
        Until opcion = 4
        Display "Las existencias valen $", valor(existencias, precios)
        Stop

        Module mostrarExistencias(existencias, precios)
            For Each nombre In existencias
                If existencias[nombre] < 10 Then
                    Display nombre, ": ", existencias[nombre], " a $", precios[nombre], " -- se acaba"
                Else
                    Display nombre, ": ", existencias[nombre], " a $", precios[nombre]
                End If
            End For
        End Module

        Function Boolean hayArticulo(existencias, articulo)
            For Each nombre In existencias
                If nombre = articulo Then
                    Return True
                End If
            End For
            Return False
        End Function

        Function Real valor(existencias, precios)
            Declare Real total
            total = 0
            For Each nombre In existencias
                total = total + existencias[nombre] * precios[nombre]
            End For
            Return round(total, 2)
        End Function
    """),
    "e_tictactoe_p": program("""
        Start
        Declare Integer jugada
        Declare Integer turnos
        Declare String jugador
        Declare String ganador
        tablero = [" ", " ", " ", " ", " ", " ", " ", " ", " "]
        jugador = "X"
        ganador = ""
        turnos = 0
        While ganador = "" And turnos < 9
            Call mostrarTablero(tablero)
            Display "Jugador ", jugador, ", elige una casilla del 1 al 9"
            Input jugada
            While jugada < 1 Or jugada > 9
                Display "Las casillas van del 1 al 9"
                Input jugada
            End While
            If tablero[jugada - 1] <> " " Then
                Display "Esa casilla ya está ocupada"
            Else
                tablero[jugada - 1] = jugador
                turnos = turnos + 1
                If haGanado(tablero, jugador) Then
                    ganador = jugador
                Else If jugador = "X" Then
                    jugador = "O"
                Else
                    jugador = "X"
                End If
            End If
        End While
        Call mostrarTablero(tablero)
        If ganador = "" Then
            Display "Empate"
        Else
            Display "¡Gana el jugador ", ganador, "!"
        End If
        Stop

        Module mostrarTablero(casillas)
            For fila = 0 To 2
                Display " ", casillas[fila * 3], " | ", casillas[fila * 3 + 1], " | ", casillas[fila * 3 + 2]
                If fila < 2 Then
                    Display "---+---+---"
                End If
            End For
        End Module

        Function Boolean haGanado(casillas, marca)
            filas = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]
            For Each tres In filas
                If casillas[tres[0]] = marca And casillas[tres[1]] = marca And casillas[tres[2]] = marca Then
                    Return True
                End If
            End For
            Return False
        End Function
    """),
    "e_weather_p": program("""
        Start
        Declare Real promedio
        Declare Integer encima
        Declare Integer racha
        Declare Integer mayorRacha
        maximas = [61, 64, 70, 73, 69, 66, 72, 78, 81, 79, 75, 68, 63, 67]
        Display "Máximas de cada día: ", maximas
        promedio = media(maximas)
        Display "Máxima media: ", round(promedio, 1)
        Display "Día más cálido: ", mayor(maximas), "   Día más fresco: ", menor(maximas)
        encima = 0
        racha = 0
        mayorRacha = 0
        For dia = 1 To length(maximas)
            If maximas[dia - 1] > promedio Then
                encima = encima + 1
                racha = racha + 1
                If racha > mayorRacha Then
                    mayorRacha = racha
                End If
            Else
                racha = 0
            End If
            Display "Día ", dia, ": ", barra(maximas[dia - 1]), " ", maximas[dia - 1]
        End For
        Display encima, " días fueron más cálidos que la media"
        Display "La racha cálida más larga duró ", mayorRacha, " días"
        Stop

        Function Real media(valores)
            Declare Real total
            total = 0
            For Each v In valores
                total = total + v
            End For
            Return total / length(valores)
        End Function

        Function Integer mayor(valores)
            Declare Integer mejor
            mejor = valores[0]
            For Each v In valores
                If v > mejor Then
                    mejor = v
                End If
            End For
            Return mejor
        End Function

        Function Integer menor(valores)
            Declare Integer mejor
            mejor = valores[0]
            For Each v In valores
                If v < mejor Then
                    mejor = v
                End If
            End For
            Return mejor
        End Function

        Function String barra(Integer grados)
            Declare String estrellas
            estrellas = ""
            For i = 1 To grados div 5
                estrellas = estrellas + "*"
            End For
            Return estrellas
        End Function
    """),
    "e_sortsearch_p": program("""
        Start
        Declare Integer objetivo
        Declare Integer pos
        Declare Integer cambios
        notas = [72, 95, 64, 88, 79, 91, 57, 83]
        Display "Notas tal como llegaron: ", notas
        cambios = ordenarBurbuja(notas)
        Display "Ordenadas: ", notas
        Display "Ordenar costó ", cambios, " intercambios"
        Display "¿Qué nota busco?"
        Input objetivo
        pos = busquedaBinaria(notas, objetivo)
        If pos = -1 Then
            Display objetivo, " no es ninguna de las notas"
        Else
            Display objetivo, " es la número ", pos + 1, " de ", length(notas), " empezando por abajo"
        End If
        Stop

        Function Integer ordenarBurbuja(valores)
            Declare Integer cambios
            Declare Integer temporal
            Declare Boolean cambiado
            cambios = 0
            Do
                cambiado = False
                For i = 0 To length(valores) - 2
                    If valores[i] > valores[i + 1] Then
                        temporal = valores[i]
                        valores[i] = valores[i + 1]
                        valores[i + 1] = temporal
                        cambios = cambios + 1
                        cambiado = True
                    End If
                End For
            Until Not cambiado
            Return cambios
        End Function

        Function Integer busquedaBinaria(valores, objetivo)
            Declare Integer bajo
            Declare Integer alto
            Declare Integer medio
            bajo = 0
            alto = length(valores) - 1
            While bajo <= alto
                medio = (bajo + alto) div 2
                If valores[medio] = objetivo Then
                    Return medio
                Else If valores[medio] < objetivo Then
                    bajo = medio + 1
                Else
                    alto = medio - 1
                End If
            End While
            Return -1
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
    # ---- the games (37-games.js): a name, a line saying what it is, how
    # to play it, and the program -- written in modules, so it is a
    # chart to each one, or one chart with the option that draws every
    # module where it is called.  Smallest first; the last four are big.
    "g_coin": "Cara o Cruz",
    "g_coin_d": "Adivina cara o cruz, cinco tiros seguidos",
    "g_coin_h": "Di cada tiro antes de que caiga la moneda: escribe 1 para cara o 2 para cruz. Son cinco tiros. ¿Cuántos aciertas?",
    "g_highlow": "Mayor o Menor",
    "g_highlow_d": "Adivina si la siguiente carta será más alta que esta",
    "g_highlow_h": "Se voltea una carta. Escribe 1 si crees que la siguiente será más alta, o 2 si será más baja. El as es la más baja. Cada fallo te cuesta una de tus 3 vidas, y hay diez cartas en total.",
    "g_sticks": "Veintiún Palitos",
    "g_sticks_d": "Toma 1, 2 o 3 palitos, pero no el último",
    "g_sticks_h": "Hay 21 palitos. Tú y la computadora toman 1, 2 o 3 por turno, y quien tome el último palito pierde. La computadora sabe un truco. ¿Puedes descubrirlo?",
    "g_dice": "Duelo de Dados",
    "g_dice_d": "Tira dos dados contra la computadora, gana quien llegue a 3",
    "g_dice_h": "Pulsa Enter para tirar dos dados y luego tira la computadora. La suma más alta gana la ronda, y los dobles cuentan el doble. Quien gane primero 3 rondas gana el duelo.",
    "g_hangman": "El Ahorcado",
    "g_hangman_d": "Descubre la palabra oculta letra por letra",
    "g_hangman_h": "Adivina la palabra oculta letra por letra. Cada letra equivocada añade una parte al dibujo, y con seis fallos se acaba el juego.",
    "g_codebreak": "Descifra el Código",
    "g_codebreak_d": "Descifra un código secreto de 4 dígitos en 10 intentos",
    "g_codebreak_h": "La computadora elige un código de 4 dígitos, cada uno del 1 al 6. Escribe un intento como 1234. Te dice cuántos dígitos están bien y en su lugar, y cuántos están bien pero en otro lugar. Descífralo en 10 intentos.",
    "g_dungeon": "Escape de la Mazmorra",
    "g_dungeon_d": "Una aventura de texto con lámpara, llave, troll y oro",
    "g_dungeon_h": "Recorre la mazmorra escribiendo n, s, e u o. Escribe mira para mirar alrededor, toma para recoger algo y bolsa para ver lo que llevas. Encuentra el oro y sácalo por la reja antes de que se apague tu antorcha, y cuidado con el troll.",
    "g_connect": "Conecta Cuatro",
    "g_connect_d": "Suelta fichas y haz cuatro en línea antes que la computadora",
    "g_connect_h": "Tú eres X y la computadora es O. Escribe una columna del 1 al 7 para soltar una ficha en ella. Cuatro en línea ganan: en horizontal, en vertical o en diagonal.",
    "g_blackjack": "Blackjack",
    "g_blackjack_d": "Gánale al crupier llegando a 21 sin pasarte",
    "g_blackjack_h": "Apuesta parte de tus 100 fichas. Luego escribe 1 para pedir otra carta, 2 para plantarte o 3 para doblar la apuesta por una última carta. Acércate más a 21 que el crupier sin pasarte. J, Q y K valen 10, y un A vale 1 u 11.",
    "g_battleship": "Batalla Naval",
    "g_battleship_d": "Hunde la flota enemiga antes de que hunda la tuya",
    "g_battleship_h": "Cada lado esconde tres barcos en un mar de 6 por 6. Dispara escribiendo una letra y un número, como B4. X es tocado y o es agua. Hunde todos los barcos enemigos antes de que el enemigo hunda los tuyos.",
    "g_math": "Cálculo rápido",
    "g_math_d": "Ocho cuentas, con premio por cada acierto seguido",
    "g_math_h": "Salen ocho cuentas, una tras otra: sumas, restas y tablas de multiplicar. Escribe cada respuesta. Un acierto vale un punto más que el anterior de la racha, así que mantén la racha.",
    "g_pig": "Pig",
    "g_pig_d": "Tira tantas veces como te atrevas, pero un 1 lo pierde todo",
    "g_pig_h": "En tu turno tira el dado tantas veces como quieras, sumando lo que sacas. Escribe t para tirar otra vez o p para plantarte y guardar los puntos. Si sacas un 1, pierdes todo lo de ese turno. La computadora también juega, y gana quien llegue primero a 50.",
    "g_lander": "Alunizaje",
    "g_lander_d": "Quema el combustible justo para posarte con suavidad en la Luna",
    "g_lander_h": "Empiezas a 500 m sobre la Luna, cayendo. Cada segundo, escribe cuánto combustible quemar, de 0 a 20: cuanto más quemas, más frenas, pero el combustible se acaba. Pósate a 5 m por segundo o menos para alunizar sin peligro.",
    "g_mines": "Buscaminas",
    "g_mines_d": "Abre cada casilla segura de un campo de minas, con los números como pistas",
    "g_mines_h": "Hay siete minas escondidas en un campo de 6 por 6 casillas. Escribe una casilla como B4 para abrirla. Un número te dice cuántas de las casillas de alrededor tienen una mina, y una casilla vacía abre todas las de alrededor. Escribe M y una casilla, como MB4, para marcar una casilla donde estás seguro de que hay una mina, o para quitar la marca. Abre todas las casillas sin mina para ganar.",
    "g_coin_p": program("""
        Start
        Declare Integer eleccion
        Declare Integer lado
        Declare Integer aciertos
        aciertos = 0
        For tiro = 1 To 5
            Display "Tiro ", tiro, " de 5. Elige: 1 para cara, 2 para cruz"
            Input eleccion
            While eleccion < 1 Or eleccion > 2
                Display "Escribe 1 para cara o 2 para cruz"
                Input eleccion
            End While
            lado = random(1, 2)
            Display "¡Sale ", nombreLado(lado), "!"
            If eleccion = lado Then
                aciertos = aciertos + 1
                Display "Acertaste"
            Else
                Display "Esta vez no"
            End If
        End For
        Display "Acertaste ", aciertos, " de 5"
        If aciertos >= 4 Then
            Display "¡Qué suerte!"
        End If
        Stop

        Function String nombreLado(Integer lado)
            Declare String nombre
            If lado = 1 Then
                nombre = "cara"
            Else
                nombre = "cruz"
            End If
            Return nombre
        End Function
    """),
    "g_highlow_p": program("""
        Start
        Declare Integer carta
        Declare Integer siguiente
        Declare Integer eleccion
        Declare Integer puntos
        Declare Integer vidas
        Declare Integer turno
        carta = random(1, 13)
        puntos = 0
        vidas = 3
        turno = 0
        Display "¿La siguiente carta será más alta o más baja? El as es la más baja. Tienes 3 vidas"
        While turno < 10 And vidas > 0
            turno = turno + 1
            Display "Carta ", turno, " de 10: ", nombreCarta(carta), ". ¿La siguiente será 1 más alta o 2 más baja?"
            Input eleccion
            While eleccion < 1 Or eleccion > 2
                Display "Escribe 1 para más alta o 2 para más baja"
                Input eleccion
            End While
            siguiente = random(1, 13)
            Display "La siguiente carta: ", nombreCarta(siguiente)
            If siguiente = carta Then
                Display "¡La misma otra vez! Esa no cuenta"
            Else If (eleccion = 1 And siguiente > carta) Or (eleccion = 2 And siguiente < carta) Then
                puntos = puntos + 1
                Display "¡Bien! Puntos: ", puntos
            Else
                vidas = vidas - 1
                Display "¡Fallaste! Vidas que quedan: ", vidas
            End If
            carta = siguiente
        End While
        Display "Fin del juego. Hiciste ", puntos, " puntos"
        Call mostrarNota(puntos)
        Stop

        Function String nombreCarta(Integer n)
            nombres = ["As", "Dos", "Tres", "Cuatro", "Cinco", "Seis", "Siete", "Ocho", "Nueve", "Diez", "Jota", "Reina", "Rey"]
            Return nombres[n - 1]
        End Function

        Module mostrarNota(Integer puntos)
            If puntos >= 8 Then
                Display "¡Eres un as de las cartas!"
            Else If puntos >= 5 Then
                Display "Bien jugado"
            Else
                Display "Más suerte la próxima vez"
            End If
        End Module
    """),
    "g_sticks_p": program("""
        Start
        Declare Integer palitos
        Declare Integer cantidad
        Declare Integer primero
        Declare Boolean tuTurno
        palitos = 21
        Display "Hay 21 palitos. Toma 1, 2 o 3 cada vez. Quien tome el último palito pierde"
        Display "¿Quién empieza? 1 para ti, 2 para la computadora"
        Input primero
        While primero < 1 Or primero > 2
            Display "Escribe 1 o 2"
            Input primero
        End While
        tuTurno = primero = 1
        While palitos > 0
            Call mostrarPalitos(palitos)
            If tuTurno Then
                Display "¿Cuántos tomas?"
                Input cantidad
                While cantidad < 1 Or cantidad > 3 Or cantidad > palitos
                    Display "Toma 1, 2 o 3, y no más de los que hay"
                    Input cantidad
                End While
            Else
                cantidad = computadoraToma(palitos)
                Display "La computadora toma ", cantidad
            End If
            palitos = palitos - cantidad
            tuTurno = Not tuTurno
        End While
        If tuTurno Then
            Display "La computadora tomó el último palito. ¡Ganaste!"
        Else
            Display "Tomaste el último palito, así que gana la computadora"
            Display "Hay un truco. Fíjate en cuántos palitos te deja la computadora"
        End If
        Stop

        Module mostrarPalitos(Integer quedan)
            Declare String fila
            fila = ""
            For i = 1 To quedan
                fila = fila + "|"
            End For
            Display fila, "  (", quedan, " quedan)"
        End Module

        Function Integer computadoraToma(Integer quedan)
            Declare Integer cuantos
            cuantos = (quedan - 1) mod 4
            If cuantos = 0 Then
                cuantos = random(1, 3)
            End If
            If cuantos > quedan Then
                cuantos = quedan
            End If
            Return cuantos
        End Function
    """),
    "g_dice_p": program("""
        Start
        Declare Integer misVictorias
        Declare Integer susVictorias
        Declare Integer ronda
        Declare Integer a
        Declare Integer b
        Declare Integer mios
        Declare Integer suyos
        Declare String listo
        misVictorias = 0
        susVictorias = 0
        ronda = 0
        Display "Duelo de dados: el par de dados más alto gana la ronda. Los dobles cuentan el doble. Gana quien llegue primero a 3"
        While misVictorias < 3 And susVictorias < 3
            ronda = ronda + 1
            Display "Ronda ", ronda, ". Pulsa Enter para tirar"
            Input listo
            a = tirarDado()
            b = tirarDado()
            mios = puntosDe(a, b)
            Call mostrarTirada("Tú", a, b, mios)
            a = tirarDado()
            b = tirarDado()
            suyos = puntosDe(a, b)
            Call mostrarTirada("La computadora", a, b, suyos)
            If mios > suyos Then
                misVictorias = misVictorias + 1
                Display "¡Ganas la ronda!"
            Else If suyos > mios Then
                susVictorias = susVictorias + 1
                Display "La computadora gana la ronda"
            Else
                Display "Empate, nadie suma"
            End If
            Display "Rondas ganadas: tú ", misVictorias, ", la computadora ", susVictorias
        End While
        If misVictorias = 3 Then
            Display "¡Ganas el duelo!"
        Else
            Display "La computadora gana el duelo"
        End If
        Stop

        Function Integer tirarDado()
            Return random(1, 6)
        End Function

        Function Integer puntosDe(Integer primero, Integer segundo)
            Declare Integer puntos
            puntos = primero + segundo
            If primero = segundo Then
                puntos = puntos * 2
            End If
            Return puntos
        End Function

        Module mostrarTirada(String quien, Integer primero, Integer segundo, Integer puntos)
            Display quien, ": ", primero, " y ", segundo, ", son ", puntos, " puntos"
            If primero = segundo Then
                Display "¡Dobles! Cuentan el doble"
            End If
        End Module
    """),
    "g_hangman_p": program("""
        Start
        Declare String secreta
        Declare String probadas
        Declare String letra
        Declare Integer fallos
        Declare Boolean ganado
        palabras = ["planeta", "selva", "cohete", "pirata", "mago", "castillo", "tortuga", "guitarra", "camino", "ballena", "estrella", "manta"]
        secreta = palabras[random(0, length(palabras) - 1)]
        probadas = ""
        fallos = 0
        ganado = False
        Display "¡El ahorcado! Adivina la palabra letra por letra. Con seis fallos pierdes"
        While fallos < 6 And Not ganado
            Call mostrarHorca(fallos)
            Display "La palabra: ", oculta(secreta, probadas)
            Display "Di una letra"
            Input letra
            letra = toLower(letra)
            If length(letra) <> 1 Then
                Display "Una letra cada vez, por favor"
            Else If contains(probadas, letra) Then
                Display "Ya probaste la ", letra
            Else
                probadas = probadas + letra
                If contains(secreta, letra) Then
                    Display "Sí, hay una ", letra
                Else
                    fallos = fallos + 1
                    Display "No hay ", letra, ". Fallos: ", fallos, " de 6"
                End If
                ganado = todasHalladas(secreta, probadas)
            End If
        End While
        Call mostrarHorca(fallos)
        If ganado Then
            Display "¡Lo lograste: ", secreta, "! Ganaste"
        Else
            Display "Se acabaron los intentos. La palabra era ", secreta
        End If
        Stop

        Function String oculta(String palabra, String letras)
            Declare String mostrada
            Declare String caracter
            mostrada = ""
            For i = 0 To length(palabra) - 1
                caracter = substring(palabra, i, i + 1)
                If contains(letras, caracter) Then
                    mostrada = mostrada + caracter + " "
                Else
                    mostrada = mostrada + "_ "
                End If
            End For
            Return mostrada
        End Function

        Function Boolean todasHalladas(String palabra, String letras)
            Declare Boolean halladas
            halladas = True
            For i = 0 To length(palabra) - 1
                If Not contains(letras, substring(palabra, i, i + 1)) Then
                    halladas = False
                End If
            End For
            Return halladas
        End Function

        Module mostrarHorca(Integer errores)
            cabezas = ["   ", " O ", " O ", " O ", " O ", " O ", " O "]
            cuerpos = ["   ", "   ", " | ", "-| ", "-|-", "-|-", "-|-"]
            piernas = ["   ", "   ", "   ", "   ", "   ", "|  ", "| |"]
            Display "  +---+"
            Display "  |   |"
            Display "  |  ", cabezas[errores]
            Display "  |  ", cuerpos[errores]
            Display "  |  ", piernas[errores]
            Display "==+=="
        End Module
    """),
    "g_codebreak_p": program("""
        Start
        Declare String codigo
        Declare String intento
        Declare Boolean valido
        Declare Boolean descifrado
        Declare Integer exactos
        Declare Integer cerca
        Declare Integer intentos
        codigo = crearCodigo()
        intentos = 0
        descifrado = False
        Display "Estoy pensando en un código de 4 dígitos. Cada dígito va del 1 al 6, y se pueden repetir"
        Display "Después de cada intento digo cuántos dígitos están en su lugar y cuántos están bien pero en otro lugar"
        While Not descifrado And intentos < 10
            intentos = intentos + 1
            Display "Intento ", intentos, " de 10:"
            Input intento
            valido = esValido(intento)
            While Not valido
                Display "Escribe 4 dígitos del 1 al 6, como 1234"
                Input intento
                valido = esValido(intento)
            End While
            exactos = lugarCorrecto(codigo, intento)
            cerca = digitosComunes(codigo, intento) - exactos
            Display intento, "   en su lugar: ", exactos, "   en otro lugar: ", cerca
            If exactos = 4 Then
                descifrado = True
            End If
        End While
        If descifrado Then
            Display "¡Lo descifraste en ", intentos, " intentos!"
        Else
            Display "Se acabaron los intentos. El código era ", codigo
        End If
        Stop

        Function String crearCodigo()
            Declare String creado
            creado = ""
            For i = 1 To 4
                creado = creado + random(1, 6)
            End For
            Return creado
        End Function

        Function Boolean esValido(String texto)
            Declare Boolean bueno
            bueno = length(texto) = 4
            If bueno Then
                For i = 0 To 3
                    If Not contains("123456", substring(texto, i, i + 1)) Then
                        bueno = False
                    End If
                End For
            End If
            Return bueno
        End Function

        Function Integer lugarCorrecto(String secreto, String probado)
            Declare Integer aciertos
            aciertos = 0
            For i = 0 To 3
                If substring(secreto, i, i + 1) = substring(probado, i, i + 1) Then
                    aciertos = aciertos + 1
                End If
            End For
            Return aciertos
        End Function

        Function Integer digitosComunes(String secreto, String probado)
            Declare Integer ambos
            Declare Integer enSecreto
            Declare Integer enIntento
            Declare String digito
            ambos = 0
            For d = 1 To 6
                digito = "" + d
                enSecreto = 0
                enIntento = 0
                For i = 0 To 3
                    If substring(secreto, i, i + 1) = digito Then
                        enSecreto = enSecreto + 1
                    End If
                    If substring(probado, i, i + 1) = digito Then
                        enIntento = enIntento + 1
                    End If
                End For
                If enSecreto < enIntento Then
                    ambos = ambos + enSecreto
                Else
                    ambos = ambos + enIntento
                End If
            End For
            Return ambos
        End Function
    """),
    "g_dungeon_p": program("""
        Start
        Declare Integer sala
        Declare Integer destino
        Declare Integer direccion
        Declare Integer salud
        Declare Integer pasos
        Declare String orden
        Declare Boolean hayTroll
        Declare Boolean jugando
        objetos = ["", "", "lámpara", "espada", "llave", "", "oro"]
        salidas = [[1, -1, -1, -1], [5, 0, 3, 2], [-1, 4, 1, -1], [-1, -1, -1, 1], [2, -1, -1, -1], [6, 1, -1, -1], [-1, 5, -1, -1]]
        bolsa = []
        sala = 0
        salud = 3
        pasos = 0
        hayTroll = True
        jugando = True
        Display "ESCAPE DE LA MAZMORRA"
        Display "Encuentra el oro y sácalo por la reja antes de que se apague tu antorcha"
        Display "Escribe n, s, e u o para caminar, o mira, toma, bolsa o ayuda"
        Call describir(sala, objetos, bolsa)
        While jugando
            Display "¿Y ahora?"
            Input orden
            orden = toLower(orden)
            direccion = direccionDe(orden)
            If direccion >= 0 Then
                destino = salidas[sala][direccion]
                pasos = pasos + 1
                If destino = -1 Then
                    Display "Por ahí no se puede ir"
                Else If destino = 6 And hayTroll Then
                    If contains(bolsa, "espada") Then
                        Display "El troll bloquea la puerta. Sacas tu espada, ¡y huye aullando hacia la oscuridad!"
                        hayTroll = False
                    Else
                        salud = salud - 1
                        Display "¡El troll bloquea la puerta y te aparta de un manotazo! Salud: ", salud
                    End If
                Else If destino = 6 And Not contains(bolsa, "llave") Then
                    Display "La puerta del norte está bien cerrada. Si tan solo tuvieras una llave"
                Else
                    sala = destino
                    Call describir(sala, objetos, bolsa)
                    If sala = 4 And Not contains(bolsa, "lámpara") Then
                        salud = salud - 1
                        Display "¡Tropiezas en la oscuridad y te golpeas la cabeza! Salud: ", salud
                    End If
                    If sala = 5 And hayTroll Then
                        Display "¡Un troll enorme vigila la puerta del fondo!"
                    End If
                End If
            Else If orden = "mira" Then
                Call describir(sala, objetos, bolsa)
            Else If orden = "toma" Then
                Call tomarObjeto(sala, objetos, bolsa)
            Else If orden = "bolsa" Then
                Call mostrarBolsa(bolsa)
            Else If orden = "ayuda" Then
                Display "Camina con n, s, e y o. Escribe mira para mirar alrededor, toma para recoger algo y bolsa para ver lo que llevas"
            Else
                Display "No sé cómo hacer eso: ", orden
            End If
            If sala = 0 And contains(bolsa, "oro") Then
                Display "Abres la reja de un empujón y sales al sol con el oro. Escapaste en ", pasos, " pasos!"
                jugando = False
            Else If salud <= 0 Then
                Display "Caes sobre el frío suelo de piedra. Esta vez gana la mazmorra"
                jugando = False
            Else If pasos >= 40 Then
                Display "Tu antorcha parpadea y se apaga. Te quedas perdido en la oscuridad para siempre"
                jugando = False
            Else If pasos = 30 And direccion >= 0 Then
                Display "Tu antorcha se está apagando. ¡Quedan diez pasos!"
            End If
        End While
        Stop

        Function Integer direccionDe(String dicho)
            Declare Integer hallada
            hallada = -1
            If dicho = "n" Then
                hallada = 0
            Else If dicho = "s" Then
                hallada = 1
            Else If dicho = "e" Then
                hallada = 2
            Else If dicho = "o" Then
                hallada = 3
            End If
            Return hallada
        End Function

        Module describir(Integer aqui, cosas, llevado)
            nombres = ["Reja", "Gran Salón", "Biblioteca", "Armería", "Sótano", "Puente del Troll", "Cámara del Tesoro"]
            textos = ["La reja de hierro está cerrada a tus espaldas. Un pasillo lleva al norte.", "Un gran salón con puertas al norte, al este y al oeste. La reja queda al sur.", "Estantes polvorientos llenos de libros viejos. Una trampilla en el suelo baja hacia el sur, y hay una puerta al este.", "Las paredes están llenas de armas oxidadas. La única salida está al oeste.", "Un sótano húmedo que huele a moho. Una escalera sube hacia el norte.", "Un estrecho puente de piedra sobre un abismo, con una pesada puerta al fondo, al norte. El salón queda al sur.", "Cofres llenos de tesoros brillan a tu alrededor. El puente queda al sur."]
            Display "== ", nombres[aqui], " =="
            If aqui = 4 And Not contains(llevado, "lámpara") Then
                Display "Aquí está oscuro como boca de lobo. No ves nada."
            Else
                Display textos[aqui]
                If cosas[aqui] <> "" Then
                    Display "Ves: ", cosas[aqui]
                End If
            End If
        End Module

        Module tomarObjeto(Integer aqui, cosas, llevado)
            If aqui = 4 And Not contains(llevado, "lámpara") Then
                Display "Tanteas en la oscuridad, pero no encuentras nada"
            Else If cosas[aqui] = "" Then
                Display "Aquí no hay nada que tomar"
            Else
                append(llevado, cosas[aqui])
                Display "Tomas: ", cosas[aqui]
                cosas[aqui] = ""
            End If
        End Module

        Module mostrarBolsa(llevado)
            Declare String lista
            If length(llevado) = 0 Then
                Display "Tu bolsa está vacía"
            Else
                lista = ""
                For Each cosa In llevado
                    lista = lista + cosa + " "
                End For
                Display "En tu bolsa: ", lista
            End If
        End Module
    """),
    "g_connect_p": program("""
        Start
        Declare Integer columna
        Declare Integer fila
        Declare Integer jugadas
        Declare String ficha
        Declare String ganador
        tablero = nuevoTablero()
        jugadas = 0
        ficha = "X"
        ganador = ""
        Display "¡Conecta cuatro! Tú eres X y la computadora es O. Suelta tus fichas para hacer cuatro en línea"
        Display "Valen filas, columnas y diagonales"
        While ganador = "" And jugadas < 42
            Call mostrarTablero(tablero)
            If ficha = "X" Then
                Display "Te toca. Elige una columna del 1 al 7"
                Input columna
                fila = -1
                While fila = -1
                    While columna < 1 Or columna > 7
                        Display "Las columnas van del 1 al 7"
                        Input columna
                    End While
                    fila = filaCaida(tablero, columna - 1)
                    If fila = -1 Then
                        Display "Esa columna está llena. Elige otra"
                        Input columna
                    End If
                End While
                columna = columna - 1
            Else
                columna = columnaComputadora(tablero)
                fila = filaCaida(tablero, columna)
                Display "La computadora suelta una ficha en la columna ", columna + 1
            End If
            tablero[fila][columna] = ficha
            jugadas = jugadas + 1
            If cuatroDesde(tablero, fila, columna, ficha) Then
                ganador = ficha
            Else If ficha = "X" Then
                ficha = "O"
            Else
                ficha = "X"
            End If
        End While
        Call mostrarTablero(tablero)
        If ganador = "X" Then
            Display "¡Cuatro en línea! ¡Ganaste!"
        Else If ganador = "O" Then
            Display "La computadora hizo cuatro en línea. Esta vez gana ella"
        Else
            Display "El tablero está lleno. Es un empate"
        End If
        Stop

        Function nuevoTablero()
            filas = []
            For r = 1 To 6
                casillas = []
                For c = 1 To 7
                    append(casillas, ".")
                End For
                append(filas, casillas)
            End For
            Return filas
        End Function

        Module mostrarTablero(tabla)
            Declare String linea
            For r = 0 To 5
                linea = "|"
                For c = 0 To 6
                    linea = linea + " " + tabla[r][c]
                End For
                Display linea, " |"
            End For
            Display "+---------------+"
            Display "  1 2 3 4 5 6 7"
        End Module

        Function Integer filaCaida(tabla, Integer c)
            Declare Integer masBaja
            masBaja = -1
            For r = 0 To 5
                If tabla[r][c] = "." Then
                    masBaja = r
                End If
            End For
            Return masBaja
        End Function

        Function Boolean cuatroDesde(tabla, Integer fila, Integer columna, String pieza)
            Declare Integer enLinea
            Declare Integer r
            Declare Integer c
            Declare Boolean sigue
            Declare Boolean hallado
            hallado = False
            direcciones = [[0, 1], [1, 0], [1, 1], [1, -1]]
            For Each direccion In direcciones
                enLinea = 1
                For sentido = -1 To 1 Step 2
                    r = fila + direccion[0] * sentido
                    c = columna + direccion[1] * sentido
                    sigue = True
                    While sigue
                        If r < 0 Or r > 5 Or c < 0 Or c > 6 Then
                            sigue = False
                        Else If tabla[r][c] <> pieza Then
                            sigue = False
                        Else
                            enLinea = enLinea + 1
                            r = r + direccion[0] * sentido
                            c = c + direccion[1] * sentido
                        End If
                    End While
                End For
                If enLinea >= 4 Then
                    hallado = True
                End If
            End For
            Return hallado
        End Function

        Function Integer columnaComputadora(tabla)
            Declare Integer eleccion
            Declare Integer r
            eleccion = -1
            fichas = ["O", "X"]
            For Each pieza In fichas
                For c = 0 To 6
                    If eleccion = -1 Then
                        r = filaCaida(tabla, c)
                        If r >= 0 Then
                            tabla[r][c] = pieza
                            If cuatroDesde(tabla, r, c, pieza) Then
                                eleccion = c
                            End If
                            tabla[r][c] = "."
                        End If
                    End If
                End For
            End For
            While eleccion = -1
                c = random(0, 6)
                If tabla[0][c] = "." Then
                    eleccion = c
                End If
            End While
            Return eleccion
        End Function
    """),
    "g_blackjack_p": program("""
        Start
        Declare Integer fichas
        Declare Integer apuesta
        Declare Integer eleccion
        Declare Integer mia
        Declare Integer suya
        Declare Integer cambio
        Declare Boolean jugando
        Declare Boolean plantado
        fichas = 100
        jugando = True
        Display "¡Blackjack! Acércate más a 21 que el crupier sin pasarte"
        Display "Las cartas con número valen lo que dicen, J, Q y K valen 10, y un A vale 1 u 11"
        While jugando
            mazo = nuevoMazo()
            Display "Tienes ", fichas, " fichas. ¿Cuántas apuestas?"
            Input apuesta
            While apuesta < 1 Or apuesta > fichas
                Display "Apuesta de 1 a ", fichas
                Input apuesta
            End While
            tu = []
            crupier = []
            append(tu, pop(mazo))
            append(crupier, pop(mazo))
            append(tu, pop(mazo))
            append(crupier, pop(mazo))
            plantado = False
            While Not plantado
                mia = valorMano(tu)
                If mia >= 21 Then
                    plantado = True
                Else
                    Call mostrarMesa(tu, mia, crupier)
                    Display "1 para pedir carta, 2 para plantarte, 3 para doblar"
                    Input eleccion
                    While eleccion < 1 Or eleccion > 3
                        Display "Escribe 1, 2 o 3"
                        Input eleccion
                    End While
                    If eleccion = 3 And (length(tu) > 2 Or apuesta * 2 > fichas) Then
                        Display "Solo puedes doblar con tus dos primeras cartas, y si tienes fichas para cubrirlo"
                    Else If eleccion = 2 Then
                        plantado = True
                    Else
                        append(tu, pop(mazo))
                        If eleccion = 3 Then
                            apuesta = apuesta * 2
                            Display "Apuesta doblada a ", apuesta, ", y solo una carta más"
                            plantado = True
                        End If
                    End If
                End If
            End While
            mia = valorMano(tu)
            If mia < 21 Or (mia = 21 And length(tu) > 2) Then
                Call crupierJuega(crupier, mazo)
            End If
            suya = valorMano(crupier)
            Call mostrarManos(tu, mia, crupier, suya)
            cambio = liquidar(mia, length(tu), suya, length(crupier), apuesta)
            fichas = fichas + cambio
            If cambio > 0 Then
                Display "Ganas ", cambio, " fichas"
            Else If cambio < 0 Then
                Display "Pierdes ", 0 - cambio, " fichas"
            Else
                Display "Empate: recuperas tu apuesta"
            End If
            If fichas = 0 Then
                Display "Te quedaste sin fichas. Esta vez gana la banca"
                jugando = False
            Else
                Display "1 para otra mano, 2 para retirarte"
                Input eleccion
                While eleccion < 1 Or eleccion > 2
                    Display "Escribe 1 o 2"
                    Input eleccion
                End While
                jugando = eleccion = 1
            End If
        End While
        Display "Te levantas de la mesa con ", fichas, " fichas"
        If fichas > 100 Then
            Display "¡Son ", fichas - 100, " más de las que tenías al sentarte!"
        End If
        Stop

        Function nuevoMazo()
            Declare Integer otra
            Declare Integer guardada
            cartas = []
            For i = 0 To 51
                append(cartas, i)
            End For
            For i = 51 To 1 Step -1
                otra = random(0, i)
                guardada = cartas[i]
                cartas[i] = cartas[otra]
                cartas[otra] = guardada
            End For
            Return cartas
        End Function

        Function String nombreCarta(Integer carta)
            valores = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
            palos = ["♠", "♥", "♦", "♣"]
            Return valores[carta mod 13] + palos[carta div 13]
        End Function

        Function Integer valorMano(mano)
            Declare Integer total
            Declare Integer ases
            Declare Integer valor
            total = 0
            ases = 0
            For Each carta In mano
                valor = carta mod 13 + 1
                If valor = 1 Then
                    total = total + 11
                    ases = ases + 1
                Else If valor > 10 Then
                    total = total + 10
                Else
                    total = total + valor
                End If
            End For
            While total > 21 And ases > 0
                total = total - 10
                ases = ases - 1
            End While
            Return total
        End Function

        Function String textoMano(mano)
            Declare String texto
            texto = ""
            For Each carta In mano
                texto = texto + nombreCarta(carta) + " "
            End For
            Return texto
        End Function

        Module mostrarMesa(jugador, Integer total, banca)
            Display "Crupier: ", nombreCarta(banca[0]), " ??"
            Display "Tú:      ", textoMano(jugador), "(", total, ")"
        End Module

        Module mostrarManos(jugador, Integer total, banca, Integer totalBanca)
            Display "Crupier: ", textoMano(banca), "(", totalBanca, ")"
            Display "Tú:      ", textoMano(jugador), "(", total, ")"
        End Module

        Module crupierJuega(mano, cartas)
            Declare Integer total
            Do
                total = valorMano(mano)
                If total < 17 Then
                    append(mano, pop(cartas))
                End If
            Until total >= 17
        End Module

        Function Integer liquidar(Integer mia, Integer misCartas, Integer suya, Integer susCartas, Integer monto)
            Declare Integer ganado
            If mia > 21 Then
                Display "¡Te pasaste de 21!"
                ganado = 0 - monto
            Else If mia = 21 And misCartas = 2 And (suya <> 21 Or susCartas > 2) Then
                Display "¡Blackjack! Se paga 3 a 2"
                ganado = monto * 3 div 2
            Else If suya = 21 And susCartas = 2 And (mia <> 21 Or misCartas > 2) Then
                Display "El crupier tiene blackjack"
                ganado = 0 - monto
            Else If suya > 21 Then
                Display "¡El crupier se pasa!"
                ganado = monto
            Else If mia > suya Then
                ganado = monto
            Else If mia < suya Then
                ganado = 0 - monto
            Else
                ganado = 0
            End If
            Return ganado
        End Function
    """),
    "g_battleship_p": program("""
        Start
        Declare String disparo
        Declare Integer casilla
        Declare Integer resultado
        Declare Integer misRestantes
        Declare Integer susRestantes
        Declare Integer turno
        propio = marVacio()
        enemigo = marVacio()
        Call colocarFlota(propio)
        Call colocarFlota(enemigo)
        misRestantes = 9
        susRestantes = 9
        turno = 0
        Display "¡Batalla naval! Cada lado tiene tres barcos de 4, 3 y 2 casillas. Hunde los suyos antes de que hundan los tuyos"
        Display "S es tu barco, X un acierto y o un fallo. Dispara con una letra y un número, como B4"
        While misRestantes > 0 And susRestantes > 0
            Call mostrarMares(propio, enemigo)
            turno = turno + 1
            casilla = -1
            While casilla = -1
                Display "Turno ", turno, ". ¿Adónde disparas?"
                Input disparo
                casilla = casillaDe(disparo)
                If casilla = -1 Then
                    Display "Escribe una letra de la A a la F y un número del 1 al 6, como B4"
                End If
            End While
            resultado = dispararA(enemigo, casilla)
            If resultado = 2 Then
                Display "¡Tocado!"
            Else If resultado = 1 Then
                Display "Agua. Fallaste"
            Else
                Display "Ya disparaste a ", disparo
            End If
            susRestantes = barcosRestantes(enemigo)
            If susRestantes > 0 Then
                casilla = apuntaEnemigo(propio)
                resultado = dispararA(propio, casilla)
                If resultado = 2 Then
                    Display "El enemigo dispara a ", nombreDe(casilla), ". ¡Le dio a tu barco!"
                Else
                    Display "El enemigo dispara a ", nombreDe(casilla), " y falla"
                End If
                misRestantes = barcosRestantes(propio)
            End If
            Display "Casillas de barco que quedan: tuyas ", misRestantes, ", suyas ", susRestantes
        End While
        Call mostrarMares(propio, enemigo)
        If susRestantes = 0 Then
            Display "¡Hundiste toda su flota en ", turno, " turnos! ¡Victoria!"
        Else
            Display "Tu flota está hundida. El enemigo gana esta batalla"
        End If
        Stop

        Function marVacio()
            mar = []
            For i = 1 To 36
                append(mar, ".")
            End For
            Return mar
        End Function

        Module colocarFlota(mar)
            Declare Integer fila
            Declare Integer columna
            Declare Integer horizontal
            Declare Boolean cabe
            tamanos = [4, 3, 2]
            For Each tamano In tamanos
                cabe = False
                While Not cabe
                    horizontal = random(0, 1)
                    If horizontal = 1 Then
                        fila = random(0, 5)
                        columna = random(0, 6 - tamano)
                    Else
                        fila = random(0, 6 - tamano)
                        columna = random(0, 5)
                    End If
                    cabe = True
                    For k = 0 To tamano - 1
                        If mar[(fila + k * (1 - horizontal)) * 6 + columna + k * horizontal] <> "." Then
                            cabe = False
                        End If
                    End For
                End While
                For k = 0 To tamano - 1
                    mar[(fila + k * (1 - horizontal)) * 6 + columna + k * horizontal] = "S"
                End For
            End For
        End Module

        Module mostrarMares(mio, ajeno)
            Declare String linea
            Declare String celda
            Display "   Tu flota         Aguas enemigas"
            Display "   1 2 3 4 5 6      1 2 3 4 5 6"
            For r = 0 To 5
                linea = substring("ABCDEF", r, r + 1) + "  "
                For c = 0 To 5
                    linea = linea + mio[r * 6 + c] + " "
                End For
                linea = linea + "  " + substring("ABCDEF", r, r + 1) + "  "
                For c = 0 To 5
                    celda = ajeno[r * 6 + c]
                    If celda = "S" Then
                        celda = "."
                    End If
                    linea = linea + celda + " "
                End For
                Display linea
            End For
        End Module

        Function Integer casillaDe(String texto)
            Declare Integer fila
            Declare Integer columna
            Declare Integer cuadro
            cuadro = -1
            If length(texto) = 2 Then
                fila = indexOf("ABCDEF", toUpper(substring(texto, 0, 1)))
                columna = indexOf("123456", substring(texto, 1, 2))
                If fila >= 0 And columna >= 0 Then
                    cuadro = fila * 6 + columna
                End If
            End If
            Return cuadro
        End Function

        Function String nombreDe(Integer cuadro)
            Return substring("ABCDEF", cuadro div 6, cuadro div 6 + 1) + (cuadro mod 6 + 1)
        End Function

        Function Integer dispararA(mar, Integer cuadro)
            Declare Integer resultado
            If mar[cuadro] = "S" Then
                mar[cuadro] = "X"
                resultado = 2
            Else If mar[cuadro] = "." Then
                mar[cuadro] = "o"
                resultado = 1
            Else
                resultado = 0
            End If
            Return resultado
        End Function

        Function Integer barcosRestantes(mar)
            Declare Integer aflote
            aflote = 0
            For Each celda In mar
                If celda = "S" Then
                    aflote = aflote + 1
                End If
            End For
            Return aflote
        End Function

        Function Integer apuntaEnemigo(mar)
            Declare Integer fila
            Declare Integer columna
            cercanas = []
            For i = 0 To 35
                If mar[i] = "X" Then
                    fila = i div 6
                    columna = i mod 6
                    If fila > 0 Then
                        append(cercanas, i - 6)
                    End If
                    If fila < 5 Then
                        append(cercanas, i + 6)
                    End If
                    If columna > 0 Then
                        append(cercanas, i - 1)
                    End If
                    If columna < 5 Then
                        append(cercanas, i + 1)
                    End If
                End If
            End For
            objetivos = []
            For Each cuadro In cercanas
                If mar[cuadro] = "." Or mar[cuadro] = "S" Then
                    append(objetivos, cuadro)
                End If
            End For
            If length(objetivos) = 0 Then
                For i = 0 To 35
                    If mar[i] = "." Or mar[i] = "S" Then
                        append(objetivos, i)
                    End If
                End For
            End If
            Return objetivos[random(0, length(objetivos) - 1)]
        End Function
    """),
    "g_math_p": program("""
        Start
        Declare Integer puntos
        Declare Integer racha
        Declare Integer mejor
        Declare Integer respuesta
        Declare Integer correcta
        puntos = 0
        racha = 0
        mejor = 0
        Display "Cálculo rápido: ocho cuentas. Cada acierto seguido vale un punto más que el anterior"
        For ronda = 1 To 8
            correcta = pideCuenta(ronda)
            Input respuesta
            If respuesta = correcta Then
                racha = racha + 1
                puntos = puntos + racha
                Display "¡Correcto! Llevas ", racha, " seguidas"
                If racha > mejor Then
                    mejor = racha
                End If
            Else
                Display "Casi: era ", correcta
                racha = 0
            End If
        End For
        Call muestraPuntos(puntos, mejor)
        Stop

        Function Integer pideCuenta(Integer ronda)
            Declare Integer a
            Declare Integer b
            Declare Integer tipo
            Declare Integer resultado
            a = random(2, 9 + ronda)
            b = random(2, 9)
            tipo = random(1, 3)
            If tipo = 1 Then
                Display "Cuenta ", ronda, ": ¿cuánto es ", a, " + ", b, "?"
                resultado = a + b
            Else If tipo = 2 Then
                Display "Cuenta ", ronda, ": ¿cuánto es ", a + b, " - ", b, "?"
                resultado = a
            Else
                Display "Cuenta ", ronda, ": ¿cuánto es ", a, " x ", b, "?"
                resultado = a * b
            End If
            Return resultado
        End Function

        Module muestraPuntos(Integer puntos, Integer mejor)
            Display "Tu puntuación: ", puntos, " puntos. Racha más larga de aciertos: ", mejor
            If puntos >= 30 Then
                Display "¡Un genio de los números!"
            Else If puntos >= 12 Then
                Display "¡Bien hecho!"
            Else
                Display "Sigue practicando y vuelve a intentarlo"
            End If
        End Module
    """),
    "g_pig_p": program("""
        Start
        Declare Integer mios
        Declare Integer suyos
        mios = 0
        suyos = 0
        Display "Pig: tira tantas veces como te atrevas. Un 1 pierde todo lo de ese turno. Gana quien llegue primero a 50"
        While mios < 50 And suyos < 50
            mios = mios + tuTurno(mios)
            Display "Marcador: tú ", mios, ", la computadora ", suyos
            If mios < 50 Then
                suyos = suyos + turnoComputadora(suyos)
                Display "Marcador: tú ", mios, ", la computadora ", suyos
            End If
        End While
        If mios >= 50 Then
            Display "¡Llegas primero a 50 y ganas!"
        Else
            Display "La computadora llega primero a 50 y gana"
        End If
        Stop

        Function Integer tuTurno(Integer marcador)
            Declare Integer guardados
            Declare Integer tirada
            Declare String eleccion
            Declare Boolean sigue
            guardados = 0
            sigue = True
            While sigue
                tirada = random(1, 6)
                If tirada = 1 Then
                    Display "Sacas un 1 y pierdes los ", guardados, " puntos de este turno"
                    guardados = 0
                    sigue = False
                Else
                    guardados = guardados + tirada
                    Display "Sacas ", tirada, ". Este turno: ", guardados, ". En total: ", marcador + guardados
                    If marcador + guardados >= 50 Then
                        sigue = False
                    Else
                        Display "Escribe t para tirar otra vez, o p para plantarte"
                        Input eleccion
                        If eleccion = "p" Or eleccion = "P" Then
                            sigue = False
                        End If
                    End If
                End If
            End While
            Return guardados
        End Function

        Function Integer turnoComputadora(Integer marcador)
            Declare Integer guardados
            Declare Integer tirada
            guardados = 0
            tirada = 0
            While tirada <> 1 And guardados < 15 And marcador + guardados < 50
                tirada = random(1, 6)
                If tirada = 1 Then
                    guardados = 0
                Else
                    guardados = guardados + tirada
                End If
            End While
            If tirada = 1 Then
                Display "La computadora saca un 1 y no suma nada"
            Else
                Display "La computadora se planta con ", guardados, " puntos"
            End If
            Return guardados
        End Function
    """),
    "g_lander_p": program("""
        Start
        Declare Real altura
        Declare Real velocidad
        Declare Integer combustible
        Declare Integer segundos
        Declare Integer quema
        altura = 500
        velocidad = 0
        combustible = 150
        segundos = 0
        Display "Alunizaje: estás a 500 m de altura y cayendo. Cada segundo, quema de 0 a 20 unidades de combustible para frenar"
        Display "Pósate a 5 m por segundo o menos para alunizar sin peligro"
        While altura > 0
            Call muestraPanel(segundos, altura, velocidad, combustible)
            quema = pideQuema(combustible)
            combustible = combustible - quema
            velocidad = velocidad + 1.6 - quema * 0.3
            altura = altura - velocidad
            segundos = segundos + 1
        End While
        Call aterrizaje(velocidad, combustible, segundos)
        Stop

        Module muestraPanel(Integer segundos, Real altura, Real velocidad, Integer combustible)
            Display "Tiempo ", segundos, " s. Altura ", round(altura), " m. Cayendo a ", round(velocidad, 1), " m/s. Combustible ", combustible
        End Module

        Function Integer pideQuema(Integer combustible)
            Declare Integer quema
            quema = 0
            If combustible <= 0 Then
                Display "¡Sin combustible!"
            Else
                Display "¿Cuánto combustible quemar, de 0 a 20?"
                Input quema
                While quema < 0 Or quema > 20
                    Display "Quema de 0 a 20"
                    Input quema
                End While
                If quema > combustible Then
                    Display "Solo quedan ", combustible, ", así que quemas todo"
                    quema = combustible
                End If
            End If
            Return quema
        End Function

        Module aterrizaje(Real velocidad, Integer combustible, Integer segundos)
            If velocidad <= 5 Then
                Display "¡El Águila ha alunizado! A ", round(velocidad, 1), " m/s tras ", segundos, " segundos, con ", combustible, " de combustible de sobra"
                If velocidad <= 2 Then
                    Display "¡Un alunizaje perfecto!"
                End If
            Else If velocidad <= 12 Then
                Display "Un alunizaje duro a ", round(velocidad), " m/s. El módulo queda abollado, pero sales caminando"
            Else
                Display "Chocas contra la superficie a ", round(velocidad), " m/s y haces un cráter nuevo"
            End If
        End Module
    """),
    "g_mines_p": program("""
        Start
        Declare Integer abiertas
        Declare Integer seguras
        Declare Integer casilla
        Declare String jugada
        Declare String dicho
        Declare Boolean vivo
        campo = campoNuevo()
        visto = vistaNueva()
        Call ponMinas(campo, 7)
        seguras = 36 - 7
        abiertas = 0
        vivo = True
        Display "Buscaminas: hay 7 minas escondidas en un campo de 6 por 6. Abre todas las casillas sin mina"
        Display "Escribe una casilla como B4 para abrirla, o M y una casilla, como MB4, para marcar una mina"
        While vivo And abiertas < seguras
            Call muestraCampo(campo, visto, False)
            Input jugada
            dicho = toUpper(jugada)
            If length(dicho) = 3 And substring(dicho, 0, 1) = "M" Then
                casilla = casillaDe(substring(dicho, 1, 3))
                If casilla = -1 Then
                    Display "Eso no es una casilla. Prueba algo como MB4"
                Else If visto[casilla] = "." Then
                    visto[casilla] = "M"
                Else If visto[casilla] = "M" Then
                    visto[casilla] = "."
                End If
            Else
                casilla = casillaDe(dicho)
                If casilla = -1 Then
                    Display "Eso no es una casilla. Prueba algo como B4"
                Else If visto[casilla] <> "." Then
                    Display "Esa casilla ya está abierta o marcada"
                Else If campo[casilla] = -1 Then
                    vivo = False
                Else
                    abiertas = abiertas + abreDesde(campo, visto, casilla)
                End If
            End If
        End While
        Call muestraCampo(campo, visto, True)
        If vivo Then
            Display "Todas las casillas seguras están abiertas. ¡Limpiaste el campo!"
        Else
            Display "¡Bum! Esa casilla tenía una mina debajo. Más suerte la próxima vez"
        End If
        Stop

        Function campoNuevo()
            celdas = []
            For i = 1 To 36
                append(celdas, 0)
            End For
            Return celdas
        End Function

        Function vistaNueva()
            celdas = []
            For i = 1 To 36
                append(celdas, ".")
            End For
            Return celdas
        End Function

        Module ponMinas(campo, Integer cuantas)
            Declare Integer puestas
            Declare Integer sitio
            puestas = 0
            While puestas < cuantas
                sitio = random(0, 35)
                If campo[sitio] <> -1 Then
                    campo[sitio] = -1
                    puestas = puestas + 1
                End If
            End While
            For sitio = 0 To 35
                If campo[sitio] <> -1 Then
                    campo[sitio] = minasAlrededor(campo, sitio)
                End If
            End For
        End Module

        Function Integer minasAlrededor(campo, Integer sitio)
            Declare Integer cuantas
            Declare Integer r
            Declare Integer c
            cuantas = 0
            For dr = -1 To 1
                For dc = -1 To 1
                    r = sitio div 6 + dr
                    c = sitio mod 6 + dc
                    If r >= 0 And r < 6 And c >= 0 And c < 6 Then
                        If campo[r * 6 + c] = -1 Then
                            cuantas = cuantas + 1
                        End If
                    End If
                End For
            End For
            Return cuantas
        End Function

        Function Integer abreDesde(campo, visto, Integer inicio)
            Declare Integer cuantas
            Declare Integer sitio
            Declare Integer vecina
            Declare Integer pos
            Declare Integer r
            Declare Integer c
            pendientes = [inicio]
            visto[inicio] = textoDe(campo[inicio])
            cuantas = 1
            pos = 0
            While pos < length(pendientes)
                sitio = pendientes[pos]
                pos = pos + 1
                If campo[sitio] = 0 Then
                    For dr = -1 To 1
                        For dc = -1 To 1
                            r = sitio div 6 + dr
                            c = sitio mod 6 + dc
                            If r >= 0 And r < 6 And c >= 0 And c < 6 Then
                                vecina = r * 6 + c
                                If visto[vecina] = "." Then
                                    visto[vecina] = textoDe(campo[vecina])
                                    cuantas = cuantas + 1
                                    append(pendientes, vecina)
                                End If
                            End If
                        End For
                    End For
                End If
            End While
            Return cuantas
        End Function

        Function String textoDe(Integer minas)
            Declare String texto
            texto = " "
            If minas > 0 Then
                texto = "" + minas
            End If
            Return texto
        End Function

        Module muestraCampo(campo, visto, Boolean todas)
            Declare String linea
            Display "    1 2 3 4 5 6"
            For r = 0 To 5
                linea = substring("ABCDEF", r, r + 1) + " |"
                For c = 0 To 5
                    If todas And campo[r * 6 + c] = -1 Then
                        linea = linea + " *"
                    Else
                        linea = linea + " " + visto[r * 6 + c]
                    End If
                End For
                Display linea
            End For
        End Module

        Function Integer casillaDe(String texto)
            Declare Integer fila
            Declare Integer columna
            Declare Integer hallada
            fila = -1
            columna = -1
            hallada = -1
            If length(texto) = 2 Then
                fila = indexOf("ABCDEF", substring(texto, 0, 1))
                columna = indexOf("123456", substring(texto, 1, 2))
            End If
            If fila >= 0 And columna >= 0 Then
                hallada = fila * 6 + columna
            End If
            Return hallada
        End Function
    """),
    # ---- icons, and a drawing run as what it is: a home walked through,
    # work passed on, data sent, a circuit switched on, a launch
    # (03-icons.js, 11-hand-icons.js, 37-board.js to 39-orbit.js)
    "ic_open": "Iconos",
    "ic_open_tip": "Profesiones, muebles, dispositivos y más",
    "ic_find": "Buscar iconos",
    "ic_none": "Ningún icono coincide.",
    "ic_all": "Todos",
    "ic_recent": "Recientes",
    "ic_people": "Profesiones",
    "ic_devices": "Ordenadores y red",
    "ic_circuit": "Circuitos",
    "ic_travel": "Transporte y ciudad",
    "ic_space": "Espacio",
    "ic_things": "Cosas e ideas",
    "fp_unit": "m",
    "fp_area": "{n} m²",
    "n_i_person": "Persona",
    "n_i_man": "Hombre",
    "n_i_woman": "Mujer",
    "n_i_child": "Niño",
    "n_i_elder": "Persona mayor",
    "n_i_team": "Equipo",
    "n_i_doctor": "Médico",
    "n_i_nurse": "Enfermero",
    "n_i_surgeon": "Cirujano",
    "n_i_dentist": "Dentista",
    "n_i_pharmacist": "Farmacéutico",
    "n_i_paramedic": "Paramédico",
    "n_i_patient": "Paciente",
    "n_i_chef": "Chef",
    "n_i_baker": "Panadero",
    "n_i_waiter": "Camarero",
    "n_i_farmer": "Agricultor",
    "n_i_gardener": "Jardinero",
    "n_i_builder": "Obrero",
    "n_i_engineer": "Ingeniero",
    "n_i_electrician": "Electricista",
    "n_i_plumber": "Fontanero",
    "n_i_mechanic": "Mecánico",
    "n_i_carpenter": "Carpintero",
    "n_i_painter": "Pintor",
    "n_i_cleaner": "Conserje",
    "n_i_miner": "Minero",
    "n_i_artist": "Artista",
    "n_i_musician": "Músico",
    "n_i_photographer": "Fotógrafo",
    "n_i_reporter": "Reportero",
    "n_i_teacher": "Docente",
    "n_i_student": "Estudiante",
    "n_i_graduate": "Graduado",
    "n_i_librarian": "Bibliotecario",
    "n_i_scientist": "Científico",
    "n_i_programmer": "Programador",
    "n_i_office": "Oficinista",
    "n_i_manager": "Gerente",
    "n_i_accountant": "Contable",
    "n_i_receptionist": "Recepcionista",
    "n_i_agent": "Teleoperador",
    "n_i_cashier": "Cajero",
    "n_i_customer": "Cliente",
    "n_i_police": "Policía",
    "n_i_firefighter": "Bombero",
    "n_i_soldier": "Soldado",
    "n_i_guard": "Vigilante",
    "n_i_lawyer": "Abogado",
    "n_i_judge": "Juez",
    "n_i_pilot": "Piloto",
    "n_i_astronaut": "Astronauta",
    "n_i_driver": "Conductor",
    "n_i_delivery": "Repartidor",
    "n_i_postman": "Cartero",
    "n_i_hairdresser": "Peluquero",
    "n_i_coach": "Entrenador",
    "n_i_room": "Habitación",
    "n_i_wall": "Pared",
    "n_i_door": "Puerta",
    "n_i_door2": "Puerta doble",
    "n_i_slide": "Puerta corredera",
    "n_i_window": "Ventana",
    "n_i_stairs": "Escalera",
    "n_i_bed": "Cama doble",
    "n_i_bed1": "Cama individual",
    "n_i_crib": "Cuna",
    "n_i_nightstand": "Mesita de noche",
    "n_i_wardrobe": "Armario",
    "n_i_dresser": "Cómoda",
    "n_i_sofa": "Sofá",
    "n_i_armchair": "Sillón",
    "n_i_coffee": "Mesa de centro",
    "n_i_tv": "Televisor",
    "n_i_fireplace": "Chimenea",
    "n_i_piano": "Piano",
    "n_i_bookcase": "Estantería",
    "n_i_rug": "Alfombra",
    "n_i_lamp": "Lámpara de pie",
    "n_i_plant": "Planta",
    "n_i_dining": "Mesa de comedor",
    "n_i_roundtable": "Mesa redonda",
    "n_i_chair": "Silla",
    "n_i_desk": "Escritorio",
    "n_i_officechair": "Silla de oficina",
    "n_i_counter": "Encimera",
    "n_i_stove": "Cocina",
    "n_i_fridge": "Nevera",
    "n_i_kitchensink": "Fregadero",
    "n_i_toilet": "Inodoro",
    "n_i_sink": "Lavabo",
    "n_i_bathtub": "Bañera",
    "n_i_shower": "Ducha",
    "n_i_washer": "Lavadora",
    "n_i_dryer": "Secadora",
    "n_i_parked": "Coche (desde arriba)",
    "n_i_shrub": "Árbol (desde arriba)",
    "n_i_computer": "Ordenador",
    "n_i_laptop": "Portátil",
    "n_i_tablet": "Tableta",
    "n_i_phone": "Teléfono",
    "n_i_server": "Servidor",
    "n_i_database": "Base de datos",
    "n_i_router": "Router",
    "n_i_switch": "Switch de red",
    "n_i_firewall": "Cortafuegos",
    "n_i_wifi": "Wi-Fi",
    "n_i_internet": "Internet",
    "n_i_tower": "Antena de telefonía",
    "n_i_printer": "Impresora",
    "n_i_camera": "Cámara de seguridad",
    "n_i_battery": "Pila",
    "n_i_bulb": "Bombilla",
    "n_i_switch_on": "Interruptor",
    "n_i_resistor": "Resistencia",
    "n_i_capacitor": "Condensador",
    "n_i_led": "LED",
    "n_i_motor": "Motor",
    "n_i_buzzer": "Zumbador",
    "n_i_socket": "Enchufe",
    "n_i_solar": "Panel solar",
    "n_i_ground": "Toma de tierra",
    "n_i_cell": "Pila",
    "n_i_diode": "Diodo",
    "n_i_fuse": "Fusible",
    "n_i_ammeter": "Amperímetro",
    "n_i_voltmeter": "Voltímetro",
    "n_i_dimmer": "Regulador",
    "n_i_comet": "Cometa",
    "n_i_asteroid": "Asteroide",
    "n_i_station": "Estación espacial",
    "n_i_lander": "Módulo lunar",
    "n_i_galaxy": "Galaxia",
    "n_i_taxi": "Taxi",
    "n_i_tram": "Tranvía",
    "n_i_helicopter": "Helicóptero",
    "n_i_scooter": "Patinete",
    "n_i_airport": "Aeropuerto",
    "n_i_trainstation": "Estación de tren",
    "n_i_park": "Parque",
    "n_i_cafe": "Cafetería",
    "n_i_gift": "Regalo",
    "n_i_target": "Diana",
    "n_i_hourglass": "Reloj de arena",
    "n_i_music": "Música",
    "n_i_palette": "Paleta de pintor",
    "n_i_tag": "Etiqueta de precio",
    "n_i_magnet": "Imán",
    "n_i_puzzle": "Pieza de puzle",
    "n_i_car": "Coche",
    "n_i_bus": "Autobús",
    "n_i_truck": "Camión",
    "n_i_bike": "Bicicleta",
    "n_i_train": "Tren",
    "n_i_plane": "Avión",
    "n_i_ship": "Barco",
    "n_i_house": "Casa",
    "n_i_building": "Edificio de oficinas",
    "n_i_shop": "Tienda",
    "n_i_school": "Escuela",
    "n_i_hospital": "Hospital",
    "n_i_factory": "Fábrica",
    "n_i_warehouse": "Almacén",
    "n_i_tree": "Árbol",
    "n_i_traffic": "Semáforo",
    "n_i_rocket": "Cohete",
    "n_i_satellite": "Satélite",
    "n_i_sun": "Sol",
    "n_i_earth": "Tierra",
    "n_i_moon": "Luna",
    "n_i_planet": "Planeta",
    "n_i_star": "Estrella",
    "n_i_telescope": "Telescopio",
    "n_i_ufo": "OVNI",
    "n_i_zone": "Contenedor",
    "n_i_money": "Dinero",
    "n_i_coins": "Monedas",
    "n_i_cart": "Carrito",
    "n_i_package": "Paquete",
    "n_i_mail": "Correo",
    "n_i_chat": "Chat",
    "n_i_clock": "Reloj",
    "n_i_calendar": "Calendario",
    "n_i_gear": "Engranaje",
    "n_i_lock": "Candado",
    "n_i_key": "Llave",
    "n_i_idea": "Idea",
    "n_i_search": "Búsqueda",
    "n_i_check": "Visto bueno",
    "n_i_cross": "Cruz",
    "n_i_warning": "Advertencia",
    "n_i_flag": "Bandera",
    "n_i_heart": "Corazón",
    "n_i_trophy": "Trofeo",
    "n_i_chart": "Gráfico de barras",
    "n_i_book": "Libro",
    "n_i_megaphone": "Megáfono",
    "vb_i_person": "hace su parte",
    "vb_i_man": "hace su parte",
    "vb_i_woman": "hace su parte",
    "vb_i_child": "hace un dibujo",
    "vb_i_elder": "da un consejo",
    "vb_i_team": "trabaja en ello en equipo",
    "vb_i_doctor": "examina al paciente",
    "vb_i_nurse": "atiende al paciente",
    "vb_i_surgeon": "opera",
    "vb_i_dentist": "revisa los dientes",
    "vb_i_pharmacist": "prepara la receta",
    "vb_i_paramedic": "presta primeros auxilios",
    "vb_i_patient": "describe los síntomas",
    "vb_i_chef": "cocina la comida",
    "vb_i_baker": "hornea el pan",
    "vb_i_waiter": "toma el pedido",
    "vb_i_farmer": "recoge la cosecha",
    "vb_i_gardener": "riega las plantas",
    "vb_i_builder": "lo construye",
    "vb_i_engineer": "lo diseña",
    "vb_i_electrician": "hace la instalación eléctrica",
    "vb_i_plumber": "arregla las tuberías",
    "vb_i_mechanic": "repara el motor",
    "vb_i_carpenter": "monta la estructura",
    "vb_i_painter": "lo pinta",
    "vb_i_cleaner": "limpia",
    "vb_i_miner": "extrae mineral",
    "vb_i_artist": "lo dibuja",
    "vb_i_musician": "toca una melodía",
    "vb_i_photographer": "hace una foto",
    "vb_i_reporter": "escribe la noticia",
    "vb_i_teacher": "da la clase",
    "vb_i_student": "hace los deberes",
    "vb_i_graduate": "recibe el título",
    "vb_i_librarian": "encuentra el libro",
    "vb_i_scientist": "hace el experimento",
    "vb_i_programmer": "escribe el código",
    "vb_i_office": "rellena los formularios",
    "vb_i_manager": "hace el plan",
    "vb_i_accountant": "lleva las cuentas",
    "vb_i_receptionist": "da la cita",
    "vb_i_agent": "atiende la llamada",
    "vb_i_cashier": "cobra",
    "vb_i_customer": "hace el pedido",
    "vb_i_police": "investiga",
    "vb_i_firefighter": "apaga el fuego",
    "vb_i_soldier": "monta guardia",
    "vb_i_guard": "comprueba la acreditación",
    "vb_i_lawyer": "defiende el caso",
    "vb_i_judge": "dicta sentencia",
    "vb_i_pilot": "pilota el avión",
    "vb_i_astronaut": "entra en órbita",
    "vb_i_driver": "lo lleva en coche",
    "vb_i_delivery": "entrega el paquete",
    "vb_i_postman": "reparte el correo",
    "vb_i_hairdresser": "corta el pelo",
    "vb_i_coach": "entrena al equipo",
    "wk_i_bed": "duerme en la cama",
    "wk_i_bed1": "echa una siesta",
    "wk_i_crib": "mira cómo está el bebé",
    "wk_i_nightstand": "enciende la lámpara de la mesita",
    "wk_i_wardrobe": "elige algo de ropa",
    "wk_i_dresser": "se viste",
    "wk_i_sofa": "se sienta en el sofá",
    "wk_i_armchair": "lee en el sillón",
    "wk_i_coffee": "deja una taza en la mesa de centro",
    "wk_i_tv": "ve la tele",
    "wk_i_fireplace": "se calienta junto a la chimenea",
    "wk_i_piano": "toca el piano",
    "wk_i_bookcase": "saca un libro",
    "wk_i_lamp": "enciende la lámpara",
    "wk_i_plant": "riega la planta",
    "wk_i_dining": "come en la mesa",
    "wk_i_roundtable": "toma un café en la mesa",
    "wk_i_chair": "se sienta",
    "wk_i_desk": "trabaja en el escritorio",
    "wk_i_officechair": "gira en la silla de oficina",
    "wk_i_counter": "prepara un sándwich",
    "wk_i_stove": "cocina en los fogones",
    "wk_i_fridge": "saca leche de la nevera",
    "wk_i_kitchensink": "friega los platos",
    "wk_i_toilet": "usa el inodoro",
    "wk_i_sink": "se lava las manos",
    "wk_i_bathtub": "se da un baño",
    "wk_i_shower": "se ducha",
    "wk_i_washer": "pone la lavadora",
    "wk_i_dryer": "seca la ropa",
    "wk_i_parked": "se sube al coche",
    "wk_i_shrub": "descansa bajo el árbol",
    "wk_i_stairs": "sube la escalera",
    "fr_kitchen": "la cocina",
    "fr_bath": "el baño",
    "fr_bed": "el dormitorio",
    "fr_laundry": "el lavadero",
    "fr_garage": "el garaje",
    "fr_office": "el despacho",
    "fr_dining": "el comedor",
    "fr_living": "el salón",
    "fr_room": "la habitación",
    "fr_closet": "el vestidor",
    "fr_studio": "el estudio",
    "fr_great": "la cocina-salón",
    "fr_eatin": "la cocina comedor",
    "fr_livdine": "el salón comedor",
    "wk_comes_in": "{who} entra por la puerta principal.",
    "wk_starts": "{who} empieza en {room}.",
    "wk_in_room": "Ahora, {room}.",
    "wk_empty": "No hay nada en {room}.",
    "wk_does": "{who} {does}.",
    "wk_cannot_reach": "No se puede llegar: {what} ({room}).",
    "wk_leaves": "{who} sale por la puerta principal.",
    "wk_no_way_in": "No se puede entrar en {room}: no tiene puerta.",
    "wk_summary": "Habitaciones recorridas: {rooms} · Cosas usadas: {used} · Superficie: {area}",
    "wk_no_rooms": "Pon una Habitación alrededor de los muebles para recorrerla.",
    "wk_door_loose": "Esta puerta no está en la pared de ninguna habitación.",
    "wk_no_door": "No hay ninguna puerta para entrar en {room}.",
    "wk_blocked": "Hay algo en una puerta: {what}.",
    "wk_sum": "Habitaciones: {rooms} · Muebles: {pieces} · Superficie: {area}",
    "wk_st_rooms": "Habitaciones",
    "wk_st_pieces": "Muebles",
    "wk_st_floor": "Superficie",
    "wk_visitor": "Una visita",
    "wk_hello": "¡Hola!",
    "bd_auto": "Automático",
    "bd_auto_is": "Automático: {what}",
    "bd_pick": "Qué es el dibujo y qué hace Ejecutar con él",
    "bd_program": "Programa",
    "bd_home": "Plano de planta",
    "bd_team": "Personas trabajando",
    "bd_network": "Red",
    "bd_circuit": "Circuito",
    "bd_space": "Espacio",
    "bd_city": "Viajes",
    "bd_flow": "Flechas",
    "bd_tidy_kept": "Un plano o un cielo se queda como lo dibujaste: Ordenar es para diagramas de flujo y organigramas.",
    "go_home": "Recorrer",
    "go_team": "Pasar el trabajo",
    "go_network": "Enviar datos",
    "go_circuit": "Encender",
    "go_space": "Lanzar",
    "go_city": "Conducir",
    "go_flow": "Seguir las flechas",
    "v3_open": "Ver en 3D",
    "v3_tip": "Verlo en 3D",
    "v3_empty": "Todavía no hay nada que construir.",
    "v3_low": "Paredes bajas",
    "v3_hint": "Arrastra o usa las flechas para girar · W A S D para moverte · rueda para acercar",
    "v3_close": "Cerrar la vista 3D",
    "pn_close": "Cerrar",
    "pn_hide": "Recoger (los rayos X siguen activos)",
    "pn_show": "Volver a mostrar la leyenda",
    "tw_alone": "Une a las personas con flechas para pasar el trabajo.",
    "tw_works": "{who}: {does}.",
    "tw_shares": "{who} reparte el trabajo: {to}.",
    "tw_back": "Todo vuelve a {who}.",
    "tw_hands": "{who} → {to}.",
    "tw_hands_what": "{who} → {to}: {what}.",
    "tw_done": "Hecho. Entregas: {hands} · Personas: {people} · Más ocupado: {who}",
    "tw_loose": "No hay flechas hacia o desde {who}.",
    "tw_sum": "Personas: {people} · Flechas: {arrows}",
    "nw_cables": "Une los dispositivos con flechas, como cables, para enviar datos.",
    "nw_none": "{who} no llega a nada.",
    "nw_allowed": "permitido",
    "nw_reply": "OK",
    "nw_route": "{path} ({ms} ms)",
    "nw_ok": "Han llegado: {n} de {all}.",
    "nw_loose": "{who} no está conectado a nada.",
    "nw_sum": "Dispositivos: {devices} · Cables: {cables}",
    "cy_none": "Une cada vehículo con flechas a los lugares adonde va.",
    "cy_still": "{who} no tiene adónde ir.",
    "cy_stop": "Parada: {place}",
    "cy_route": "{who}: {stops}",
    "cy_sum": "Vehículos: {vehicles} · Lugares: {places}",
    "fw_none": "Une las formas con flechas para seguirlas.",
    "fw_at": "→ {what}",
    "fw_done": "Flechas seguidas: {n}.",
    "fw_sum": "Formas: {shapes} · Flechas: {arrows}",
    "ec_no_source": "Añade una pila para alimentar el circuito.",
    "ec_opened": "{who}: apagado.",
    "ec_closed": "{who}: encendido.",
    "ec_press": "Haz clic en un interruptor para cambiarlo.",
    "ec_buzz": "bzzz",
    "ec_short": "¡Cortocircuito! Nada frena la corriente entre los polos de la pila.",
    "ec_open": "El circuito no está cerrado, así que no circula corriente.",
    "ec_source": "{who}: {v} V, {a}",
    "ec_dark": "{who}: sin luz.",
    "ec_too_bright": "{who}: demasiada corriente ({a}), se fundiría.",
    "ec_lit": "{who}: da luz ({a}).",
    "ec_turns": "{who}: gira ({a}).",
    "ec_still": "{who}: no gira.",
    "ec_buzzes": "{who}: suena ({a}).",
    "ec_quiet": "{who}: en silencio.",
    "ec_drop": "{who}: {v} V, {a}",
    "ec_conducts": "{who} deja pasar la corriente: {a}",
    "ec_blocks": "{who} bloquea la corriente: solo la deja pasar en el otro sentido",
    "ec_blown": "{who} se fundió: pasó demasiada corriente, y el circuito quedó abierto",
    "ec_fuse_ok": "{who} aguanta: pasan {a}",
    "ec_reads_a": "{who} marca {a}",
    "ec_reads_v": "{who} marca {v} V",
    "ec_loose": "{who} necesita un cable en cada extremo.",
    "ec_sum": "Componentes: {parts} · Cables: {wires}",
    "os_empty": "Dibuja un Sol y algunos planetas para ponerlos en marcha.",
    "os_year_vs": "{who} gira alrededor de {around}: allí un año dura {n} años terrestres.",
    "os_year": "{who} da una vuelta a {around} cada {n} segundos.",
    "os_launch": "{who} despega.",
    "os_orbit": "{who} entra en órbita alrededor de {around}.",
    "os_arrive": "{who} llega a {where}.",
    "os_landed": "Aterrizaje: {where}",
    "os_no_sun": "Añade un Sol para que los planetas giren a su alrededor.",
    "os_sum": "Astros: {bodies} · Naves: {craft}",
    "tw_again": "sigue",
    "ec_dim": "{who}: da poca luz ({a}).",
    "n_i_picture": "Cuadro",
    "n_i_mirror": "Espejo",
    "n_i_shelf": "Estante de pared",
    "n_i_walltv": "Televisor de pared",
    "n_i_wallclock": "Reloj de pared",
    "n_i_sconce": "Aplique",
    "n_i_cabinet": "Armario de pared",
    "n_i_hooks": "Perchero de pared",
    "n_i_radiator": "Radiador",
    "wk_i_picture": "mira el cuadro",
    "wk_i_mirror": "se mira en el espejo",
    "wk_i_shelf": "coge un libro del estante",
    "wk_i_walltv": "ve la tele",
    "wk_i_wallclock": "mira la hora",
    "wk_i_sconce": "enciende la luz",
    "wk_i_cabinet": "saca un plato del armario",
    "wk_i_hooks": "cuelga un abrigo",
    "wk_i_radiator": "se calienta las manos",
    "wk_locked_in": "{room} está tras una puerta cerrada con llave.",
    "v3_walk": "Recorrer",
    "v3_above": "Vista desde arriba",
    "v3_restart": "Volver a empezar",
    "v3_door": "Puerta",
    "v3_locked": "Está cerrada con llave.",
    "v3_no_door": "No hay ninguna puerta cerca.",
    "v3_hint_walk": "W A S D para andar · haz clic en la vista para mirar con el ratón, Esc lo suelta · E o un clic usa lo que tienes delante",
    "us_nothing": "Nada a tu alcance",
    "us_light_on": "Luz encendida",
    "us_light_off": "Luz apagada",
    "us_breaker_off": "Automáticos bajados: todo a oscuras",
    "us_breaker_on": "Automáticos subidos: vuelve la luz",
    "us_screen_on": "{what}: encendido",
    "us_screen_off": "{what}: apagado",
    "us_fan_on": "Ventilador encendido",
    "us_fan_off": "Ventilador apagado",
    "us_water_on": "Corre el agua",
    "us_water_off": "Agua cerrada",
    "us_heat_on": "{what}: encendido",
    "us_heat_off": "{what}: apagado",
    "us_sit": "Te sientas. Camina para levantarte",
    "us_sleep": "Has dormido bien. Ya es de día",
    "us_rest": "Te tumbas a descansar",
    "us_open": "{what}: abierto",
    "us_close": "{what}: cerrado",
    "us_flush": "Cisterna",
    "us_play": "Tocas unas notas",
    "us_plant": "Riegas la planta",
    "us_book": "Coges un libro",
    "us_pay": "Pagado. ¡Gracias!",
    "us_plug": "Enchufas algo",
    "us_shop": "Coges algo de la estantería",
    "us_coffee": "Un café recién hecho",
    "us_exercise": "Buen ejercicio",
    "us_game": "Te toca",
    "us_fish": "Los peces se acercan",
    "us_music": "Música",
    "us_write": "Escribes en la pizarra",
    "us_breaker": "El cuadro: otra vez E lo enciende todo",
    "us_car": "El coche está cerrado",
    "us_swim": "Un baño rápido",
    "wo_head": "Paredes",
    "wo_top": "Arriba",
    "wo_foot": "Abajo",
    "wo_left": "Izquierda",
    "wo_right": "Derecha",
    "wo_outside": "Pared exterior",
    "wo_outside_tip": "Una pared exterior sostiene la casa y la protege del tiempo: se queda",
    "wo_open_to": "Abierto a {room}",
    "wo_wall_to": "Pared con {room}",
    "wo_free": "Abertura de {span}. La pared no cargaba nada pesado: no hace falta viga",
    "wo_lvl": "una viga LVL de {plies} capas, de {depth} de canto",
    "wo_steel": "una viga de acero de {depth} de canto (que la calcule un ingeniero)",
    "wo_carries_floor": "Abertura de {span} bajo la planta de arriba: {beam}, sobre un pilar en cada extremo.",
    "wo_carries_roof": "Abertura de {span} bajo el centro del tejado: {beam}, sobre un pilar en cada extremo.",
    "wo_mid_post": "Una luz tan larga necesita también un pilar en el centro.",
    "wo_add_posts": "Poner los pilares",
    "ad_beam_posts": "La pared quitada entre {a} y {b} cargaba la casa: su viga necesita pilares",
    "xr_wired": "{n} enchufes, interruptores y un cuadro eléctrico instalados",
    "xr_panel": "Cuadro eléctrico",
    "xr_heater": "Calentador de agua",
    "xr_main": "Acometida de agua",
    "xr_sewer": "Al alcantarillado",
    "xr_meter": "Contador de gas",
    "xr_furnace": "Caldera",
    "xr_button": "Dentro de las paredes",
    "xr_tip": "Ver dentro de las paredes: la estructura, el cableado, las tuberías, el gas y los conductos",
    "xr_head": "Dentro de las paredes",
    "xr_frame": "Estructura: montantes, viguetas, vigas",
    "xr_power": "Cableado, color según amperios",
    "xr_water": "Agua fría y caliente",
    "xr_drain": "Desagües y ventilación",
    "xr_gas": "Gas",
    "xr_air": "Conductos de calefacción y aire",
    "xr_wire": "Poner enchufes e interruptores",
    "xr_rewire": "Volver a cablear",
    "xr_wire_tip": "Enchufes de modo que ningún punto de una pared quede a más de 1,8 m de uno, cada 1,2 m sobre las encimeras, un interruptor junto a cada puerta y un cuadro eléctrico",
    "xr_wire_tile": "Enchufes e interruptores",
    "v3_outside": "Fuera",
    "v3_tips": "Sugerencias: {n}",
    "ad_said": "Sugerencia: {what}",
    "ad_no_front": "No hay puerta principal, así que nadie puede entrar desde fuera.",
    "ad_fix_front": "Añadir puerta principal",
    "ad_window_bed": "No hay ventana en {room}: un dormitorio necesita luz natural y una salida en caso de incendio.",
    "ad_window": "No hay ventana en {room} para que entre la luz.",
    "ad_fix_window": "Añadir ventana",
    "ad_dark": "No hay ventana ni luz en {room}.",
    "ad_fix_light": "Añadir aplique",
    "ad_missing": "Falta en {room}: {what}.",
    "ad_fix_add": "Añadir: {what}",
    "ad_bath_sink": "Hay un inodoro en {room} pero ningún lavabo para lavarse las manos.",
    "ad_small_bed": "Una cama doble queda justa en {room} ({area}): unos {want} es lo cómodo.",
    "ad_back_to_tv": "De espaldas a la tele: {what}.",
    "ad_fix_face_tv": "Girarlo hacia la tele",
    "ad_door_hits": "Una puerta choca con esto al abrirse: {what}.",
    "ad_fix_flip": "Que abra hacia el otro lado",
    "ad_bath_kitchen": "La puerta de {bath} da directamente a {kitchen}.",
    "ad_boxed_in": "Nadie puede llegar a esto: {what} ({room}).",
    "ad_front_blocked": "{what} no se puede abrir: {by} está delante.",
    "ad_firewall": "Nada protege la red de Internet: pon un cortafuegos entre ellos.",
    "ad_fix_firewall": "Añadir cortafuegos",
    "ad_single": "Todo pasa por {who}: si falla, no pasa nada.",
    "ad_led": "{who} recibe demasiada corriente ({a}) y se fundiría: pon una resistencia delante.",
    "ad_fix_resistor": "Añadir resistencia",
    "ad_switch": "No hay ningún interruptor para apagarlo.",
    "ad_fix_switch": "Añadir interruptor",
    "ad_busy": "{who} hace casi todo el trabajo: repártelo.",
    "tab_code_tip": "Escribe los pasos con palabras sencillas (pseudocódigo); el diagrama se dibuja a partir de ellos",
    "tab_hand_tip": "Dibuja a mano: diagramas de flujo, planos, personas trabajando, redes, circuitos y más",
    "tab_lang_tip": "Escríbelo en un lenguaje de programación: Python, Java, C#, C++, JavaScript y más",
    "hm_icons": "Añade un icono desde Iconos, bajo las formas: púlsalo o arrástralo al papel; búscalo por su nombre",
    "hm_room": "Mueve una habitación o un contenedor, y todo lo que contiene se mueve con él",
    "hm_door": "Pon una puerta, una ventana o un cuadro junto a una pared, y se encaja en ella",
    "hm_tie": "Une habitaciones con una flecha, o con una puerta entre ellas, y déjalas separadas en el papel: en 3D se juntan, con una puerta en la pared de en medio",
    "st_title": "Empezar una casa",
    "st_sub": "Elige las habitaciones. Se distribuyen y amueblan, unidas con flechas; en 3D se juntan, con una puerta entre cada una.",
    "st_beds": "Dormitorios",
    "st_baths": "Baños",
    "st_open_plan": "Cocina y comedor en una sola habitación",
    "st_open_living": "Planta abierta",
    "st_office": "Un despacho",
    "st_laundry": "Un lavadero",
    "st_garage": "Un garaje",
    "st_closet": "Un vestidor",
    "st_spread": "Separadas en el papel",
    "st_make": "Crear la casa",
    "st_rooms_head": "Habitaciones",
    "st_extras_head": "Además",
    "st_house_head": "La casa",
    "st_one_floor": "Una planta",
    "st_two_floors": "Dos plantas",
    "st_shuffle": "Otra",
    "st_shuffle_tip": "Otra casa con las mismas opciones",
    "st_preview": "La casa tal como se hará",
    "st_preview_sum": "{rooms} habitaciones · unos {area}",
    "st_fewer": "Menos",
    "st_more": "Más",
    "st_made": "{rooms} habitaciones distribuidas",
    "st_main": "Dormitorio principal",
    "st_bed_n": "Dormitorio {n}",
    "st_ensuite": "Baño en suite",
    "st_hall": "Pasillo",
    "hm_run_as": "Ejecutar hace lo que es el dibujo: recorre una casa, pasa el trabajo, envía datos, enciende un circuito, lanza un cohete",
    "depth": "Profundidad",
    "depth_tip": "Sombrea cada forma en su propio color y dale una sombra, para que los colores tengan volumen",
    "n_i_ac": "Aire acondicionado",
    "n_i_aquarium": "Acuario",
    "n_i_arclamp": "Lámpara de arco",
    "n_i_basket": "Cesta",
    "n_i_bathmat": "Alfombra de baño",
    "n_i_beanbag": "Puf",
    "n_i_bedking": "Cama king",
    "n_i_bench": "Banco",
    "n_i_books": "Libros",
    "n_i_bunkbed": "Litera",
    "n_i_cactus": "Cactus",
    "n_i_candle": "Vela",
    "n_i_cattree": "Rascador",
    "n_i_ceilingfan": "Ventilador de techo",
    "n_i_vent": "Rejilla de ventilación",
    "n_i_chandelier": "Araña de luces",
    "n_i_chest": "Baúl",
    "n_i_coatrack": "Perchero",
    "n_i_coffeemaker": "Cafetera",
    "n_i_console": "Videoconsola",
    "n_i_cornershelf": "Estante esquinero",
    "n_i_cubeshelf": "Estantería de cubos",
    "n_i_deck": "Terraza de madera",
    "n_i_desklamp": "Flexo",
    "n_i_dishwasher": "Lavavajillas",
    "n_i_dogbed": "Cama de perro",
    "n_i_driveway": "Entrada de coches",
    "n_i_dryrack": "Tendedero",
    "n_i_elevator": "Ascensor",
    "n_i_fan": "Ventilador",
    "n_i_fence": "Valla",
    "n_i_filing": "Archivador",
    "n_i_floor": "Nivel",
    "n_i_flowerbed": "Parterre",
    "n_i_flowers": "Flores",
    "n_i_frame": "Portarretratos",
    "n_i_fruitbowl": "Frutero",
    "n_i_garagedoor": "Puerta de garaje",
    "n_i_gardenbench": "Banco de jardín",
    "n_i_grill": "Parrilla",
    "n_i_hamper": "Cesto de la ropa",
    "n_i_hanging": "Planta colgante",
    "n_i_heater": "Calefactor",
    "n_i_hedge": "Seto",
    "n_i_herbs": "Maceta de hierbas",
    "n_i_hood": "Campana extractora",
    "n_i_hottub": "Jacuzzi",
    "n_i_ironing": "Tabla de planchar",
    "n_i_island": "Isla de cocina",
    "n_i_kettle": "Hervidor",
    "n_i_lot": "Parcela",
    "n_i_loveseat": "Sofá de dos plazas",
    "n_i_medicine": "Botiquín",
    "n_i_microwave": "Microondas",
    "n_i_monitor": "Monitor",
    "n_i_ottoman": "Otomana",
    "n_i_palm": "Palmera",
    "n_i_pantry": "Despensa",
    "n_i_path": "Sendero",
    "n_i_patio": "Mesa de patio",
    "n_i_pc": "Torre de PC",
    "n_i_pendant": "Lámpara colgante",
    "n_i_pool": "Piscina",
    "n_i_projector": "Proyector",
    "n_i_proscreen": "Pantalla de proyección",
    "n_i_recliner": "Sillón reclinable",
    "n_i_recordplayer": "Tocadiscos",
    "n_i_sectional": "Sofá esquinero",
    "n_i_shoerack": "Zapatero",
    "n_i_reachin": "Armario empotrado",
    "n_i_closetrod": "Barra de armario",
    "n_i_closetshelves": "Estantes de armario",
    "n_i_bifold": "Puerta plegable",
    "n_i_sidetable": "Mesa auxiliar",
    "n_i_soundbar": "Barra de sonido",
    "n_i_speaker": "Altavoz",
    "n_i_spiral": "Escalera de caracol",
    "n_i_stool": "Taburete",
    "n_i_succulent": "Suculenta",
    "n_i_tablelamp": "Lámpara de mesa",
    "n_i_toaster": "Tostadora",
    "n_i_towelrail": "Toallero",
    "n_i_trash": "Cubo de basura",
    "n_i_tvstand": "Mueble de TV",
    "n_i_utilitysink": "Pila de lavar",
    "n_i_vanity": "Mueble de lavabo",
    "n_i_vanitytable": "Tocador",
    "n_i_vase": "Jarrón",
    "wk_i_spiral": "sube la escalera de caracol",
    "wk_i_elevator": "toma el ascensor",
    "wk_i_dishwasher": "llena el lavavajillas",
    "wk_i_island": "corta verduras en la isla",
    "wk_i_stool": "se sienta en un taburete",
    "wk_i_trash": "saca la basura",
    "wk_i_pantry": "saca algo de la despensa",
    "wk_i_microwave": "calienta las sobras",
    "wk_i_coffeemaker": "prepara un café",
    "wk_i_toaster": "tuesta pan",
    "wk_i_kettle": "pone agua a hervir",
    "wk_i_fruitbowl": "coge una manzana",
    "wk_i_vanity": "se lava los dientes",
    "wk_i_hamper": "echa la ropa al cesto",
    "wk_i_ironing": "plancha una camisa",
    "wk_i_dryrack": "tiende la ropa",
    "wk_i_heater": "se calienta junto al calefactor",
    "wk_i_utilitysink": "enjuaga un cubo",
    "wk_i_bedking": "se estira en la cama grande",
    "wk_i_bunkbed": "sube a la litera de arriba",
    "wk_i_vanitytable": "se peina",
    "wk_i_bench": "se sienta en el banco",
    "wk_i_chest": "abre el baúl",
    "wk_i_sidetable": "deja un vaso",
    "wk_i_filing": "archiva unos papeles",
    "wk_i_loveseat": "se acurruca en el sofá",
    "wk_i_sectional": "se tumba en el sofá esquinero",
    "wk_i_recliner": "se recuesta en el sillón",
    "wk_i_ottoman": "pone los pies en alto",
    "wk_i_tvstand": "coge el mando",
    "wk_i_aquarium": "da de comer a los peces",
    "wk_i_beanbag": "se deja caer en el puf",
    "wk_i_speaker": "sube la música",
    "wk_i_tablelamp": "enciende la lámpara de mesa",
    "wk_i_desklamp": "enciende el flexo",
    "wk_i_vase": "arregla las flores",
    "wk_i_candle": "enciende una vela",
    "wk_i_books": "coge un libro",
    "wk_i_frame": "mira la foto",
    "wk_i_basket": "mira en la cesta",
    "wk_i_monitor": "mira la pantalla",
    "wk_i_succulent": "limpia la suculenta",
    "wk_i_herbs": "coge un poco de albahaca",
    "wk_i_palm": "riega la palmera",
    "wk_i_cactus": "admira el cactus",
    "wk_i_flowers": "huele las flores",
    "wk_i_arclamp": "enciende la lámpara de arco",
    "wk_i_cubeshelf": "ordena la estantería",
    "wk_i_cornershelf": "pone una planta en el estante",
    "wk_i_shoerack": "se quita los zapatos",
    "wk_i_reachin": "elige algo de ropa",
    "wk_i_closetrod": "escoge una camisa",
    "wk_i_closetshelves": "toma un suéter doblado",
    "wk_i_coatrack": "cuelga el abrigo",
    "wk_i_hood": "enciende la campana",
    "wk_i_towelrail": "coge una toalla",
    "wk_i_medicine": "toma una vitamina",
    "wk_i_soundbar": "sube el volumen",
    "wk_i_console": "juega a un videojuego",
    "wk_i_pc": "enciende el ordenador",
    "wk_i_proscreen": "ve una película en la pantalla grande",
    "wk_i_recordplayer": "pone un disco",
    "wk_i_fan": "enciende el ventilador",
    "wk_i_ac": "enciende el aire acondicionado",
    "wk_i_grill": "enciende la parrilla",
    "wk_i_pool": "se da un baño",
    "wk_i_patio": "come al aire libre",
    "wk_i_gardenbench": "se sienta en el jardín",
    "wk_i_hottub": "se relaja en el jacuzzi",
    "wk_i_dogbed": "acaricia al perro",
    "wk_i_cattree": "juega con el gato",
    "wk_i_hedge": "poda el seto",
    "wk_i_flowerbed": "quita las malas hierbas del parterre",
    "ic_rooms": "Habitaciones, puertas y escaleras",
    "ic_living": "Sala de estar",
    "ic_bedroom": "Dormitorio y despacho",
    "ic_closets": "Armarios y vestidor",
    "ic_kitchen": "Cocina y comedor",
    "ic_bath": "Baño y lavadero",
    "ic_decor": "Decoración, plantas y luces",
    "ic_walls": "En la pared y almacenaje",
    "ic_tech": "TV y electrónica",
    "ic_outdoor": "Parcela, entrada y jardín",
    "fl_ground": "Planta baja",
    "fl_up_name": "Planta alta",
    "fl_upper": "Planta alta {n}",
    "fl_lower": "Sótano {n}",
    "wk_up": "{who} sube: {floor}.",
    "wk_down": "{who} baja: {floor}.",
    "wk_lift": "{who} toma el ascensor: {floor}.",
    "wk_up_said": "¡Arriba!",
    "wk_down_said": "¡Abajo!",
    "v3_went_up": "Arriba: {floor}",
    "v3_went_down": "Abajo: {floor}",
    "v3_all_floors": "Todas las plantas",
    "v3_up_to": "Hasta: {floor}",
    "v3_floors_tip": "Mostrar todas las plantas o quitar las de arriba",
    "fp_real": "Tamaño real",
    "fp_depth": "Fondo",
    "fp_ceiling": "Techo",
    "lot_keep": "Retranqueos desde los linderos",
    "lot_front": "Frente",
    "lot_side": "Lados",
    "lot_back": "Fondo",
    "lot_says": "Parcela {w} × {d} {unit} · {area}",
    "lot_build": "Para construir: {w} × {d} {unit} · {area}",
    "lot_house": "Casa {area}",
    "lot_yard": "Jardín {area}",
    "lot_front_is": "frontal",
    "lot_side_is": "lateral",
    "lot_back_is": "trasero",
    "ad_stairs_nowhere": "Todavía no lleva a ninguna parte: {what}. Dibuja la planta de arriba al lado.",
    "ad_fix_upstairs": "Hacer que suba",
    "ad_group_house": "La casa son habitaciones sueltas: ponla en un Nivel para moverla por la parcela de una pieza.",
    "ad_fix_group": "Ponerla en un Nivel",
    "ad_too_big": "La casa ({house}) es más grande que el espacio para construir ({room}).",
    "ad_setback": "La casa invade el retranqueo {side} en {by}.",
    "ad_fix_move_in": "Moverla dentro de la línea",
    "ad_no_driveway": "Nada llega a la puerta del garaje: añade una entrada.",
    "ad_fix_driveway": "Añadir una entrada",
    "hm_floors": "Dibuja cada piso de la casa en su propio Nivel, uno al lado de otro: las escaleras en el mismo sitio suben y bajan, también en 3D",
    "hm_lot": "Pon una Parcela bajo la casa y da su tamaño y retranqueos en el panel: muestra el espacio para construir y el jardín que queda",
    "v3_roof": "Tejado",
    "v3_roof_tip": "Poner el tejado, o quitarlo para ver el interior",
    "v3_day": "Día",
    "v3_evening": "Tarde",
    "v3_night": "Noche",
    "v3_time_tip": "Hora del día: día, tarde o noche con las luces encendidas",
    "v3_save": "Guardar imagen",
    "v3_save_tip": "Guardar lo que muestra la vista como imagen",
    "v3_saved": "Imagen guardada",
    "v3_save_failed": "Este navegador no puede guardar la imagen",
    "v3_labels": "Etiquetas",
    "v3_labels_tip": "Nombrar las habitaciones y lo que hay en ellas",
    "v3_2d": "2D",
    "v3_3d": "3D",
    "v3_2d_tip": "Plano, visto desde arriba, como el plano",
    "v3_3d_tip": "Volver a levantarlo en 3D",
    "v3_hint_flat": "Arrastra o usa W A S D para mover · rueda para acercar",
    "labels": "Etiquetas",
    "labels_tip": "Nombrar los muebles y las habitaciones en un plano",
    "rl_kitchen": "Cocina",
    "rl_bath": "Baño",
    "rl_bed": "Dormitorio",
    "rl_laundry": "Lavadero",
    "rl_garage": "Garaje",
    "rl_office": "Despacho",
    "rl_dining": "Comedor",
    "rl_living": "Sala de estar",
    "rl_closet": "Vestidor",
    "rl_studio": "Estudio",
    "rl_great": "Cocina-salón",
    "rl_eatin": "Cocina comedor",
    "rl_livdine": "Salón comedor",
    "ic_all_icons": "Todos los iconos",
    "ic_sets": "Grupos de iconos",
    "ic_find_n": "Buscar entre {n} iconos",
    "ic_clear": "Borrar la búsqueda",
    "ic_count": "{n} iconos",
    "ic_found": "{n} encontrados",
    "ic_hint": "Haz clic para añadir · arrastra al papel",
    "ic_hint_touch": "Toca para añadir · arrastra al papel",
    "ic_show_set": "Mostrar solo {set}",
    "ic_browse": "Ver todos los iconos…",
    "ad_overlap": "{a} y {b} están en el mismo sitio: en 3D uno atravesaría al otro.",
    "ad_fix_apart": "Separarlos",
    "ad_in_wall": "{what} se mete en la pared: {room}.",
    "ad_fix_in": "Moverlo dentro de la habitación",
    "dz_making": "Lo que haces",
    "dz_flowchart": "Diagrama de flujo",
    "dz_flowchart_tip": "Un programa, paso a paso: ejecútalo y escríbelo como texto o código",
    "dz_design": "Diseño",
    "dz_design_tip": "Planos, personas, redes, circuitos y el espacio, en 3D",
    "dz_ask": "¿Qué vas a hacer?",
    "dz_ask_sub": "Elige uno para empezar. Puedes cambiar arriba en el panel cuando quieras, y cada uno conserva su propia hoja.",
    "dz_flow_says": "Los pasos de un programa. Ejecútalo, compruébalo y escríbelo como texto o código.",
    "dz_flow_eg": "Inicio · Proceso · Decisión · Bucle",
    "dz_design_says": "Planos y muebles, personas, redes, circuitos y el espacio. Recórrelo en 3D.",
    "dz_design_eg": "Habitaciones · Muebles · Personas · Dispositivos",
    "dz_later": "Decidir más tarde",
    "dz_add": "Añadir al diseño",
    "dz_by_set": "Iconos por grupo",
    "dz_words": "Texto",
    "dz_note": "Nota",
    "dz_shapes": "Formas",
    "dz_name": "Nombre",
    "dz_size": "Tamaño",
    "dz_height": "Altura",
    "dz_lift": "Desde el suelo",
    "dz_drop": "Bajo el techo",
    "dz_standard": "Tamaño estándar",
    "dz_standard_tip": "Volver al tamaño habitual",
    "dz_fits_room": "No más grande que {room} por dentro: {size}.",
    "dz_fits_on": "No más grande que aquello sobre lo que está: {what}.",
    "dz_under_ceiling": "Bajo el techo de {room}: {size}.",
    "dz_holds": "Lo bastante grande para lo que contiene: al menos {size}.",
    "dz_above": "Al menos tan alto como lo más alto que contiene ({what}): {size}.",
    "dz_bad_len": "Escribe una longitud, como 1,25 m o 120 cm.",
    "dz_turn_left": "Girar un cuarto a la izquierda",
    "dz_turn_right": "Girar un cuarto a la derecha",
    "dz_dims_tip": "Haz clic para escribir un tamaño",
    "dz_tidied": "Ordenado: {n} movidos.",
    "hm_dims": "Elige una pieza del plano para ver su tamaño en el papel; pulsa un tamaño para escribir otro, como 2 m",
    "dz_add_how": "Busca los iconos o elige un grupo; luego haz clic en uno para añadirlo o arrástralo al papel. Elige algo para ver su tamaño y escribir otro.",
    "dz_ceil_least": "Un techo mide al menos {size} de alto.",
    "mt_head": "Materiales",
    "mt_button": "Materiales",
    "mt_floor": "Suelo",
    "mt_wall": "Paredes interiores",
    "mt_out": "Paredes exteriores",
    "mt_roof": "Tejado",
    "mt_house": "Toda la casa",
    "mt_room": "Esta habitación",
    "mt_plain": "Estándar",
    "mt_none": "Dibuja primero las habitaciones y luego elige sus materiales.",
    "mt_boards": "Tarima de madera",
    "mt_parquet": "Parqué",
    "mt_tiles": "Baldosas",
    "mt_marble": "Mármol",
    "mt_slate": "Pizarra",
    "mt_carpet": "Moqueta",
    "mt_concrete": "Hormigón",
    "mt_paint": "Pintura",
    "mt_wallpaper": "Papel pintado",
    "mt_panels": "Paneles de madera",
    "mt_brick": "Ladrillo",
    "mt_stone": "Piedra",
    "mt_siding": "Revestimiento de tablas",
    "mt_stucco": "Estuco",
    "mt_batten": "Tabla y listón",
    "mt_shakes": "Tejuelas de cedro",
    "mtr_shingles": "Tejas asfálticas",
    "mtr_tiles": "Tejas de barro",
    "mtr_metal": "Metal",
    "mtr_slate": "Pizarra",
    "mt_herringbone": "Espiga",
    "mt_hextiles": "Baldosas hexagonales",
    "mt_checker": "Baldosas en damero",
    "mt_terrazzo": "Terrazo",
    "mt_cork": "Corcho",
    "mt_plaster": "Yeso",
    "mt_shiplap": "Tablas horizontales",
    "mt_beadboard": "Friso de madera",
    "mt_logs": "Troncos",
    "mt_timber": "Entramado",
    "mt_cladding": "Paneles de fachada",
    "mt_corrugated": "Chapa ondulada",
    "mtr_thatch": "Paja",
    "mtr_woodshakes": "Tejas de madera",
    "mtr_green": "Cubierta verde",
    "mtr_solar": "Paneles solares",
    "mt_any": "Cualquier color",
    "st_floors": "Plantas",
    "st_basement": "Un sótano",
    "st_roof_one": "Tejado de una pieza",
    "st_lot": "En su propio terreno",
    "st_stairs": "Escalera",
    "st_family": "Sala familiar",
    "st_storage": "Trastero",
    "st_utility": "Cuarto de servicio",
    "fl_basement": "Sótano",
    "hs_button": "Ajustes",
    "hs_tip": "Lo que muestra la vista 3D: la calle, el terreno, los canalones, las luces, el tiempo",
    "hs_house": "La casa",
    "hs_gutters": "Canalones y bajantes",
    "hs_porch": "Luces en las puertas exteriores",
    "hs_outside": "Afuera",
    "hs_street": "Una calle delante",
    "st_site_head": "Dónde está",
    "sf_head": "Qué lado de la calle",
    "sf_side_S": "Lado norte",
    "sf_side_N": "Lado sur",
    "sf_side_E": "Lado oeste",
    "sf_side_W": "Lado este",
    "sf_shape": "La calle",
    "sf_straight": "Recta",
    "sf_curve": "En curva",
    "addr_head": "Dirección",
    "addr_number": "Número",
    "addr_street": "Calle",
    "addr_side": "Calle lateral",
    "addr_corner": "Esquina",
    "addr_corner_none": "Sin esquina",
    "addr_corner_left": "Calle lateral a la izquierda",
    "addr_corner_right": "Calle lateral a la derecha",
    "addr_streets": "Calle del Arce|Avenida de los Robles|Camino de los Cedros|Calle de los Olmos|Paseo de los Sauces|Calle de los Abedules|Calle de los Pinos|Avenida del Lago|Plaza de los Castaños|Calle de la Colina",
    "hs_land": "El terreno y su tamaño",
    "hs_trees": "Árboles alrededor",
    "hs_weather": "Tiempo",
    "sm_head": "Probarlo contra una tormenta",
    "sm_none": "Sin tormenta",
    "sm_gale": "Viento fuerte",
    "sm_severe": "Tormenta eléctrica fuerte",
    "sm_cat1": "Huracán cat. 1",
    "sm_cat3": "Huracán cat. 3",
    "sm_cat5": "Huracán cat. 5",
    "sm_ef0": "Tornado EF0",
    "sm_ef1": "Tornado EF1",
    "sm_ef2": "Tornado EF2",
    "sm_ef3": "Tornado EF3",
    "sm_ef4": "Tornado EF4",
    "sm_ef5": "Tornado EF5",
    "sm_k_windows": "Ventanas",
    "sm_k_roof": "Tejado",
    "sm_k_walls": "Paredes",
    "sm_k_anchors": "Anclaje",
    "sm_k_sway": "Oscilación",
    "sm_k_feel": "Se nota dentro",
    "sm_k_people": "Personas",
    "sm_win_ok": "resistentes a impactos: los escombros no entran",
    "sm_win_bad": "los escombros las rompen y el viento empuja el tejado desde dentro",
    "sm_holds": "aguanta {have} frente a {need}",
    "sm_gives": "cede: {need} frente a {have}",
    "sm_at_ok": "hasta unos {speed}",
    "sm_at_bad": "desde unos {speed}",
    "sm_sway": "su parte alta se mueve {move} (el límite es {limit})",
    "sm_feel_none": "no se nota ({mg} mili-g)",
    "sm_feel_some": "apenas se nota ({mg} mili-g)",
    "sm_feel_bad": "se nota y marea ({mg} mili-g)",
    "sm_safe_ok": "el refugio mantiene a todos a salvo",
    "sm_safe_bad": "ninguna casa queda entera: hace falta un refugio",
    "sm_add": "Añadir {what}",
    "sm_all_ok": "Resiste esta tormenta.",
    "sm_not_ok": "No resistiría esta tormenta entero.",
    "sm_again": "Otra vez",
    "bp_watch": "Verlo construir",
    "bp_watch_tip": "Verlo levantarse otra vez desde el suelo",
    "cn_skip": "Construyendo · mira alrededor si quieres · Enter o Saltar para terminar",
    "mo_skip": "Saltar", "mo_skip_tip": "Terminar de construirlo ya (Enter)",
    "jb_slower": "Más lento ( [ )", "jb_faster": "Más rápido ( ] )", "jb_speed_tip": "A qué velocidad se construye",
    "jb_arrive": "Llega el equipo", "jb_stakes": "Marcando las esquinas", "jb_dig": "Excavando el sótano",
    "jb_trench": "Excavando las zanjas de cimentación", "jb_forms": "Colocando los encofrados de la losa", "jb_forms_wall": "Colocando los encofrados de los cimientos",
    "jb_rebar": "Colocando el armado", "jb_pour": "Vertiendo el hormigón", "jb_strike": "Retirando los encofrados",
    "jb_lumber": "Entrega de madera", "jb_deck": "Colocando vigas y contrapiso", "jb_frame": "Armando las paredes",
    "jb_stairs": "Construyendo la escalera", "jb_trusses": "Subiendo las cerchas con la grúa", "jb_roofboards": "Entablando el tejado",
    "jb_roofing": "Cubriendo el tejado", "jb_scaffold": "Montando el andamio", "jb_sheath": "Entablando las paredes",
    "jb_windows": "Colocando las ventanas", "jb_doors": "Colgando las puertas", "jb_siding": "Revistiendo las paredes",
    "jb_scaffold_down": "Desmontando el andamio", "jb_mep": "Instalando cables y tuberías", "jb_drywall": "Colocando placas de yeso",
    "jb_deliver": "Llegan los muebles: la carretilla descarga los palés",
    "jb_ceilings": "Terminando los techos", "jb_floors": "Colocando los suelos", "jb_fittings": "Instalando la cocina y los baños",
    "jb_fixtures": "Colocando luces e interruptores", "jb_movein": "La mudanza", "jb_family": "Por fin en casa",
    "jb_clean": "Limpiando la obra", "jb_steel": "Levantando la estructura de acero", "jb_deckpour": "Hormigonando los forjados",
    "jb_cladding": "Revistiendo el exterior", "jb_core": "Construyendo el núcleo",
    "jb_pooldig": "Excavando la piscina", "jb_poolshell": "Construyendo la piscina", "jb_poolfill": "Llenando la piscina",
    "jb_yardbuild": "Construyendo el jardín: terrazas, piscina y muebles de exterior",
    "sr_same": "Todas las habitaciones de este tipo ({n})",
    "sr_same_tip": "Un cambio en el suelo, las paredes o el techo se aplica a cada habitación de este tipo",
    "mp_fix": "Corregirlo",
    "mp_no_heater": "Hay agua caliente que dar pero no hay calentador: hay que poner uno",
    "hn_holding": "Con el enchufe de {what} en la mano: E en una toma para enchufarlo",
    "hn_dropped": "El enchufe de {what}, soltado",
    "hn_dead": "{what}: sin corriente, ha saltado el automático",
    "hn_reset": "Automático rearmado: vuelve la corriente",
    "hn_on": "{what} encendido: {w} W",
    "hn_off": "{what} apagado",
    "hn_trip": "Ha saltado el automático: {w} W en un circuito de {a} A. Rearmalo en el cuadro",
    "gp_in": "En el agua: W A S D para nadar, E en el borde para salir",
    "gp_out": "Fuera de la piscina",
    "gp_gate_shut": "La puerta de la piscina se cerró sola y quedó trabada",
    "gp_jets_on": "Chorros encendidos: el agua burbujea",
    "gp_jets_off": "Chorros apagados",
    "o3_open_gate": "Abrir la puerta de la valla",
    "o3_close_gate": "Cerrar la puerta de la valla",
    "dm_bar": "La tormenta",
    "dm_pause": "Pausar la tormenta",
    "dm_play": "Dejar que siga la tormenta",
    "dm_rate": "Velocidad",
    "dm_rate_now": "Velocidad: {rate}",
    "dm_follow": "Seguir",
    "dm_follow_tip": "Mantener la cámara en lo que se lleva la tormenta",
    "dm_again": "La tormenta otra vez",
    "dm_path": "Su recorrido",
    "dm_path_over": "Justo encima",
    "dm_path_edge": "Su borde más fuerte",
    "dm_path_near": "Cerca",
    "dm_head": "Después de la tormenta",
    "dm_wait": "Empezando…",
    "dm_close": "Cerrar",
    "dm_none": "Nada perdido: la casa resistió tal como estaba",
    "dm_total": "Unos {cost} para repararlo",
    "dm_total_so_far": "Hasta ahora, unos {cost} para repararlo",
    "dm_note": "Aproximado, según promedios de EE. UU. para 2025: el tejado unos 6,50 $ por pie cuadrado, un muro exterior unos 22 $, una ventana unos 1.000 $, construir de nuevo 162 $ por pie cuadrado (NAHB), un árbol caído unos 1.000 $, una pulgada de agua en la casa unos 25.000 $ (FEMA), un daño por rayo unos 18.600 $ (Triple-I).",
    "dm_neighbors": "{n} casas de los vecinos destruidas",
    "dm_land": "{n} árboles caídos alrededor",
    "dm_safe": "Todos en el cuarto seguro salieron ilesos",
    "dm_loss": "La casa perdida: construida de nuevo, con lo que había dentro",
    "dm_slid": "Desplazada de sus cimientos: levantada y vuelta a colocar",
    "dm_roof": "Tejado arrancado",
    "dm_cover": "Cubierta rota por el granizo",
    "dm_walls": "Muros exteriores derribados",
    "dm_windows": "Ventanas rotas",
    "dm_skin": "Revestimiento arrancado",
    "dm_chimney": "Chimenea derribada",
    "dm_things": "Muebles y pertenencias",
    "dm_fixtures": "Instalaciones arrancadas",
    "dm_flood": "Agua dentro",
    "dm_solar": "Paneles solares",
    "dm_trees": "Árboles caídos en el jardín",
    "dm_cars": "Coches siniestro total",
    "dm_sheds": "Cobertizos y juegos",
    "dm_yard": "Cosas del jardín",
    "mp_no_furnace": "Rejillas de calefacción sin nada que impulse el aire: hace falta una caldera",
    "mp_heater_room": "Un calentador de gas en {room}: en un dormitorio o un baño solo se permite uno estanco, que toma el aire de fuera",
    "mp_furnace_room": "Una caldera de gas en {room}: en un dormitorio o un baño solo se permite una estanca",
    "mp_heater_garage": "Un aparato de gas en el garaje: su llama a 46 cm del suelo, sobre un soporte, con una protección delante",
    "mp_hot_far": "{what} está a {len} de tubería del calentador, más de los {most} que permite el código: hace falta un circuito de recirculación",
    "mp_co": "Aquí se quema combustible (o hay un garaje adosado): hace falta un detector de monóxido de carbono fuera de los dormitorios, en {room}",
    "mp_co_name": "Detector de humo y CO",
    "mp_dryer_long": "El conducto de la secadora mediría {len} hasta el exterior, más de los {most} permitidos: hace falta un extractor auxiliar, o la secadora junto a una pared exterior",
    "mp_hood": "Una cocina en {room} sin campana encima",
    "mp_gfci": "{n} enchufes cerca del agua necesitan protección diferencial",
    "mp_panel_room": "El cuadro eléctrico no puede estar en un baño ni en un armario",
    "mp_need_wc": "Para unas {people} personas el código pide {need} inodoros; hay {have}",
    "mp_need_lav": "Para unas {people} personas el código pide {need} lavabos en los aseos; hay {have}",
    "mp_need_df": "Para unas {people} personas el código pide {need} fuentes de agua; hay {have}",
    "mp_need_ss": "Un edificio así necesita una pila de servicio",
    "mp_fuel_head": "Calefacción y cocina",
    "mp_fuel_gas": "Gas y electricidad",
    "mp_fuel_electric": "Todo eléctrico",
    "mp_gas_label": "{size} gas · {kbtu} kBtu/h",
    "mp_flue": "Chimenea de humos",
    "mp_direct": "Ventilación estanca, por la pared",
    "mp_tpr": "Válvula de seguridad",
    "mp_expansion": "Vaso de expansión",
    "mp_recirc": "Bomba de recirculación",
    "mp_bollard": "Bolardo de protección",
    "mp_backflow": "Antirretorno",
    "mp_grease": "Separador de grasas",
    "mp_booster": "Grupo de presión",
    "mp_prv": "Válvula reductora de presión",
    "mp_dryer_duct": "Conducto de la secadora, al exterior",
    "mp_dryer_fan": "Conducto de la secadora, con extractor auxiliar",
    "mp_cold_only": "Solo fría: ningún calentador la alimenta",
    "mp_hot_wait": "Agua caliente del calentador en {room}: {len} de tubería, unos {s} s en llegar",
    "mp_hot_now": "Caliente al momento: el circuito mantiene la tubería caliente ({len} desde el calentador en {room})",
    "mp_gas_on": "{what}: gas del contador, una línea de {size}, {kbtu} kBtu/h",
    "mp_elec_on": "{what}: eléctrico, en su propio circuito de {amps} A",
    "mp_no_gas": "{what} quema gas, pero no le llega ninguna línea de gas",
    "mp_run_hot": "El agua caliente llega a {what} en unos {s} s ({len} de tubería)",
    "n_i_fountain": "Fuente de agua potable",
    "wk_i_fountain": "bebe un trago",
    "ly_button": "Capas",
    "ly_tip": "Qué capas se pueden elegir: cierra una y solo las demás se pulsan, se enmarcan o se seleccionan",
    "ly_head": "Capas que puedes elegir",
    "ly_all": "Todas",
    "ly_only_short": "Solo",
    "ly_only_tip": "Elegir solo {layer}",
    "ly_only": "Elegir solo esta capa",
    "ly_pick_all": "Seleccionar todo lo que hay en ella",
    "ly_lock": "Cerrar esta capa",
    "ly_move": "Mover a la capa",
    "ly_own": "Volver a su propia capa",
    "ly_layer": "Capa",
    "ly_note": "Las capas cerradas se ven atenuadas: un clic las atraviesa hasta lo que hay debajo.",
    "ly_shut": "{layer} está cerrada (Capas, junto a Seleccionar)",
    "ly_rooms": "Habitaciones y plantas",
    "ly_walls": "Paredes, puertas y escaleras",
    "ly_furniture": "Muebles",
    "ly_lights": "Luz y electricidad",
    "ly_water": "Fontanería y sanitarios",
    "ly_outside": "Exterior y parcela",
    "ly_people": "Personas",
    "sm_seen": "En la tormenta: {what}",
    "sm_ev_none": "nada roto por ahora",
    "sm_ev_windows": "ventanas rotas",
    "sm_ev_roof": "tejado arrancado",
    "sm_ev_walls": "paredes derribadas",
    "sm_ev_slid": "desplazada de sus cimientos",
    "sm_ev_flew": "la casa entera arrastrada",
    "sm_ev_yard": "cosas del jardín arrastradas",
    "sm_ev_safe": "el cuarto seguro sigue en pie",
    "sm_quake1": "Terremoto moderado",
    "sm_quake2": "Terremoto fuerte",
    "sm_quake3": "Terremoto violento",
    "sm_flood1": "Inundación",
    "sm_flood2": "Inundación profunda",
    "sm_flood3": "Marejada ciclónica",
    "sm_snow1": "Nevada fuerte",
    "sm_snow2": "Nevada muy fuerte",
    "sm_snow3": "Nevada récord",
    "sm_hail1": "Granizo",
    "sm_hail2": "Granizo grande",
    "sm_hail3": "Granizo gigante",
    "sm_g_wind": "Viento",
    "sm_g_quake": "Terremoto",
    "sm_g_flood": "Inundación",
    "sm_g_snow": "Nieve",
    "sm_g_hail": "Granizo",
    "sm_k_chimney": "Chimenea",
    "sm_k_contents": "Interior",
    "sm_k_cover": "Cubierta",
    "sm_k_solar": "Paneles solares",
    "sm_chim_ok": "una chimenea de ladrillo lo aguanta",
    "sm_chim_bad": "una chimenea de ladrillo se cae con un temblor así",
    "sm_shelf_ok": "los muebles siguen en pie",
    "sm_shelf_bad": "los muebles altos se vuelcan: fíjalos a la pared",
    "sm_wet_ok": "el agua queda por debajo del suelo",
    "sm_wet_bad": "agua de {deep} sobre el suelo",
    "sm_hail_win": "piedras así de grandes rompen el cristal",
    "sm_cover_ok": "la cubierta aguanta estas piedras",
    "sm_cover_bad": "la cubierta queda destrozada",
    "sm_pv_ok": "los paneles solares aguantan estas piedras",
    "sm_pv_bad": "los paneles solares se agrietan",
    "sm_h_raised": "Elevada sobre pilotes",
    "sm_h_rafters": "Vigas más fuertes",
    "sm_h_roofing": "Cubierta resistente al impacto",
    "sm_ev_sway": "la cima oscila {move} (dibujado {times} veces más grande)",
    "sm_ev_cave": "tejado hundido",
    "sm_ev_float": "la casa entera arrastrada por el agua",
    "sm_ev_chimney": "chimenea derrumbada",
    "sm_ev_shelves": "muebles volcados",
    "sm_ev_wet": "agua dentro",
    "sm_ev_cover": "cubierta destrozada",
    "sm_ev_solar": "paneles solares agrietados",
    "sm_ev_trees": "árboles arrancados",
    "sm_ev_bare": "no queda más que la losa desnuda",
    "sm_ev_skin": "revestimiento arrancado de la torre",
    "sm_ev_surge": "marejada ciclónica sobre la tierra",
    "sm_ev_flooded": "calles y patios inundados",
    "sm_hold_head": "Lo que lo mantiene unido",
    "sm_h_ties": "Conectores antihuracán",
    "sm_h_straps": "Flejes del tejado a la cimentación",
    "sm_h_shear": "Muros de cortante",
    "sm_h_anchors": "Pernos de anclaje",
    "sm_h_impact": "Ventanas antiimpacto o contraventanas",
    "sm_h_saferoom": "Refugio antitornados",
    "sm_h_brace": "Arriostramiento en cruz",
    "sm_h_outrigger": "Cerchas de estabilización",
    "sm_h_damper": "Amortiguador de masa",
    "sm_g_fire": "Incendio forestal",
    "sm_fire1": "Incendio de pasto",
    "sm_fire2": "Incendio de matorral",
    "sm_fire3": "Fuego de copas",
    "sm_wf_flames": "llamas de {len}",
    "sm_k_embers": "Brasas",
    "sm_k_zone0": "El primer metro y medio",
    "sm_k_fireroof": "Tejado",
    "sm_k_heat": "Calor en los muros",
    "sm_k_glass": "Ventanas",
    "sm_k_leave": "Personas",
    "sm_wf_few": "un incendio de pasto lanza pocas brasas y se apagan pronto",
    "sm_wf_vents_ok": "las rejillas tienen malla: las brasas no entran al desván",
    "sm_wf_vents_bad": "las brasas entran por las rejillas y prenden el desván desde dentro",
    "sm_wf_zone_ok": "nada que arda a metro y medio de los muros",
    "sm_wf_zone_bad": "hay cosas que arden a metro y medio de los muros ({n}): las brasas las prenden y sus llamas alcanzan la casa",
    "sm_wf_roof_ok": "el tejado es de clase A: las brasas no lo prenden",
    "sm_wf_roof_bad": "tejas de madera o paja: las brasas se posan y prende",
    "sm_wf_heat_ok": "{q} en los muros con el combustible a {d}: por debajo de lo que los prende",
    "sm_wf_heat_bad": "{q} en los muros con el combustible a {d}: suficiente para prenderlos",
    "sm_wf_glass_ok": "el vidrio aguanta el calor",
    "sm_wf_glass_bad": "el calor rompe el vidrio y el fuego entra",
    "sm_wf_leave": "salir pronto: ninguna casa es lugar para esperar a que pase un incendio forestal",
    "sm_h_vents": "Rejillas contra brasas",
    "sm_h_zone0": "Metro y medio despejado",
    "sm_h_space": "Espacio defendible, 30 m",
    "sm_h_siding": "Revestimiento ignífugo",
    "sm_h_classa": "Tejado de clase A",
    "sm_k_lightning": "Rayos",
    "sm_lt_ok": "los pararrayos reciben cualquier rayo y lo llevan a tierra",
    "sm_lt_risk": "un rayo daría en la cumbrera y podría prender fuego: un pararrayos lo lleva a tierra",
    "sm_h_rod": "Pararrayos",
    "sm_g_drill": "Fuego en casa",
    "sm_drill1": "Fuego de día",
    "sm_drill2": "Fuego de noche",
    "ev_day": "todos despiertos",
    "ev_night": "todos dormidos",
    "sm_k_alarms": "Detectores de humo",
    "sm_k_wired": "Interconectados",
    "sm_k_egress": "Ventanas de escape",
    "sm_k_sprinklers": "Rociadores",
    "sm_k_out": "Salir",
    "sm_k_plan": "Un plan",
    "sm_dr_alarms_ok": "uno en cada dormitorio, fuera de ellos y en cada planta",
    "sm_dr_alarms_bad": "{n} habitaciones que deben tener detector de humo no lo tienen",
    "sm_dr_wired_ok": "si suena uno, suenan todos",
    "sm_dr_wired_bad": "cada uno suena solo: tras una puerta cerrada quizá no lo oigas",
    "sm_dr_egress_ok": "cada dormitorio tiene una ventana por la que salir",
    "sm_dr_egress_bad": "{n} dormitorios no tienen ventana por la que salir",
    "sm_dr_spr_ok": "un rociador sobre el fuego lo contiene donde empieza",
    "sm_dr_spr_none": "ninguno: el fuego crece hasta llenar la habitación",
    "sm_dr_nobody": "nadie que tenga que salir",
    "sm_dr_out_ok": "todos fuera a los {t}, la primera alarma a los {first}",
    "sm_dr_out_bad": "{n} de {of} no saldrían",
    "sm_dr_plan": "conocer dos salidas de cada habitación y un punto de encuentro fuera",
    "sm_k_exits": "Salidas",
    "sm_dr_bldg_alarm": "una alarma de incendio en todo el edificio, activada por el primer detector o por el agua que fluye a un rociador",
    "sm_dr_bldg_detect": "una alarma de incendio en todo el edificio, activada por el primer detector",
    "sm_dr_exits_ok": "{n} salidas del edificio",
    "sm_dr_exits_one": "una salida: suficiente para hasta 49 personas (aquí unas {p})",
    "sm_dr_exits_bad": "una salida para unas {p} personas: pasadas las 49 hace falta una segunda",
    "sm_h_interconnect": "Detectores interconectados",
    "sm_h_sprinklers": "Rociadores en casa",
    "sm_h_closedoors": "Dormir con la puerta cerrada",
    "sm_h_ev_alarms": "los detectores de humo",
    "sm_h_ev_windows": "ventanas de escape",
    "ev_said_alarm": "la primera alarma a los {t}",
    "ev_said_sprink": "un rociador se abrió a los {t}",
    "ev_said_out": "{n} de {of} fuera",
    "ev_said_stuck": "{n} atrapados",
    "ev_seen": "En el simulacro: {what}",
    "ev_said_none": "el fuego ha empezado",
    "ev_how_walked": "por la puerta",
    "ev_how_crawled": "a gatas bajo el humo",
    "ev_how_window": "por la ventana",
    "ev_how_trapped": "atrapado por el humo",
    "ev_how_asleep": "no despertó: no oyó ninguna alarma",
    "ev_how_noway": "sin salida",
    "sm_h_ladders": "Escaleras de escape arriba",
    "ev_how_window_wait": "en la ventana de arriba, esperando rescate",
    "ev_how_ladder": "por una escalera de escape",
    "ev_first": "La primera alarma a los {t}, {wired}",
    "ev_wired": "todas a la vez",
    "ev_alone": "cada una por su cuenta",
    "ev_no_alarm": "No sonó ningún detector",
    "ev_total_ok": "Todos fuera a los {t}",
    "ev_total_bad": "{n} atrapados",
    "ev_note": "Según la investigación: tras sonar la alarma puede haber solo dos minutos para salir (NFPA); una habitación amueblada como las de hoy puede llegar a la combustión súbita en menos de cinco minutos (UL); el humo no despierta a quien duerme, la alarma sí; una puerta cerrada retiene el humo muchos minutos.",
    "ev_all_ok": "Todos salen.",
    "ev_not_ok": "No todos saldrían.",
    "dm_head_drill": "Después del simulacro",
    "sm_ev_struck": "un rayo cayó en el tejado",
    "sm_ev_rod": "un rayo cayó en el pararrayos, sin daños",
    "dm_struck": "Rayos en el tejado",
    "wf_ev_came": "el fuego llegó a {d}",
    "wf_ev_near": "lo que había junto a los muros prendió",
    "wf_ev_caught": "la casa se incendió",
    "wf_ev_by_embers": "las brasas prendieron el desván",
    "wf_ev_by_zone0": "las llamas junto a los muros prendieron la casa",
    "wf_ev_by_fireroof": "el tejado prendió",
    "wf_ev_by_heat": "el calor prendió los muros",
    "wf_ev_by_glass": "el fuego entró por las ventanas",
    "wf_ev_burnt": "la casa ardió por completo",
    "wf_ev_held": "la casa resistió",
    "wf_seen": "En el incendio: {what}",
    "wf_all_ok": "Resiste este incendio.",
    "wf_not_ok": "Ardería en este incendio.",
    "dm_head_fire": "Después del incendio",
    "dm_burnt": "La casa ardió: construida de nuevo, con lo que había dentro",
    "dm_wf_near": "Plantas, cercas y terrazas junto a los muros",
    "dm_wf_land": "El fuego recorrió {d} de terreno hasta que el suelo despejado lo detuvo",
    "hs_tab_house": "Casa",
    "hs_tab_land": "Terreno",
    "hs_tab_street": "Calle",
    "hs_tab_weather": "Tiempo",
    "hs_bound": "Quedarse en la parcela",
    "hs_hood": "Vecinos",
    "hs_folk": "Gente y coches",
    "hs_needs_street": "Activa antes la calle",
    "ws_head": "Paisaje",
    "ws_plains": "Llanura",
    "ws_hills": "Colinas",
    "ws_mountains": "Montañas",
    "ws_forest": "Bosque",
    "ws_lake": "Junto al lago",
    "ws_beach": "Playa",
    "ws_desert": "Desierto",
    "ws_tropics": "Trópico",
    "ws_arctic": "Nieve",
    "ws_city": "Ciudad",
    "ws_debug": "Cuadrícula de pruebas",
    "wl_head": "Farolas",
    "wl_classic": "Clásica",
    "wl_lantern": "Farol",
    "wl_cobra": "De carretera",
    "wl_twin": "Doble brazo",
    "wl_modern": "Moderna",
    "wl_globe": "Globo",
    "wl_none": "Ninguna",
    "wd_edge": "Aquí termina tu parcela",
    "tr_head": "Terreno",
    "tr_auto": "Natural",
    "tr_flat": "Llano",
    "tr_gentle": "Suave",
    "tr_rolling": "Ondulado",
    "tr_steep": "Empinado",
    "tf_head": "Cimientos",
    "tf_auto": "El más adecuado",
    "tf_wall": "Muro de hormigón",
    "tf_posts": "Sobre pilotes",
    "tr_new": "Otro terreno",
    "tr_new_off": "Elige antes un terreno que no sea Llano",
    "tr_says_wall": "El terreno baja {n} bajo la casa; el muro de cimentación salva la diferencia",
    "tr_says_posts": "El terreno baja {n} bajo la casa; se apoya en pilotes, con escalones desde las puertas",
    "hs_lot_trees": "Árboles en el jardín",
    "hs_needs_trees": "Activa antes los árboles de alrededor",
    "tr_back": "Volver al plano",
    "tr_back_tip": "Volver al plano (Esc)",
    "tr_me": "Verme",
    "tr_me_off": "Mis ojos",
    "tr_me_tip": "Verte desde atrás o mirar con tus propios ojos (V)",
    "tool_view": "Arrastrar vista",
    "tool_view_tip": "Arrastrar solo mueve la vista; un toque sigue eligiendo una forma. Pulsa Mayús para cambiar",
    "dv_on": "Arrastrar vista: arrastrar solo mueve la vista",
    "dv_off": "Arrastrar vuelve a mover las cosas",
    "dv_tip3d": "Activado: arrastrar solo gira y mueve la vista. Desactivado: arrastra un mueble para moverlo. Pulsa Mayús para cambiar",
    "dv_moved": "{what} movido",
    "pl_move_room": "Mover sala",
    "pl_move_room_tip": "Arrastra para mover la sala con todo lo que hay dentro",
    "tx_head": "Aspecto",
    "tx_on": "Texturas",
    "tx_tip": "Dibujos con sus relieves y juntas, y el brillo del metal y del vidrio. Desactivadas: colores lisos.",
    "units": "Medir en",
    "units_ft": "Pies y pulgadas",
    "units_m": "Metros",
    "pw_head": "Tendido eléctrico",
    "pw_front": "Postes delante",
    "pw_back": "Postes detrás",
    "pw_under": "Subterráneo",
    "pw_none": "Ninguno",
    "hs_vents": "Salida de la secadora",
    "hs_dock": "Muelle y barca",
    "hs_dock_off": "Necesita un lago o el mar",
    "mx_head": "Mezclar con",
    "mx_one_water": "Un solo tipo de agua a la vez",
    "hs_solar": "Paneles solares",
    "v3_hint_touch": "Arrastra para girar · dos dedos para mover, pellizca para el zoom",
    "v3_hint_flat_touch": "Arrastra para mover · pellizca para el zoom",
    "v3_hint_walk_touch": "Las flechas para andar · arrastra para mirar · toca para usar lo que tienes delante",
    "hd_title": "Ya hay una casa aquí",
    "hd_sub": "¿Construir la nueva en su lugar o al lado, en la misma calle?",
    "hd_add": "Al lado",
    "hd_add_sub": "Casa {n} de la calle",
    "hd_replace": "Reemplazarla",
    "hd_replace_sub": "La casa actual desaparece (Deshacer la recupera)",
    "hd_added": "Casa {n} construida al lado",
    "hd_gap_head": "Al lado",
    "hd_gap": "Espacio entre casas",
    "hd_gap_tip": "Entre los terrenos, los tuyos y los de los vecinos",
    "ed_separate": "Separar de la casa",
    "ed_separate_n": "Separarlas de la casa",
    "ed_separated": "Separada: ahora está sola",
    "ed_separated_n": "{n} habitaciones separadas de la casa",
    "ed_join": "Unir a la casa",
    "ed_joined": "Unida a {room}",
    "ed_change": "Cambiar esta casa…",
    "ed_change_title": "Cambiar esta casa",
    "ed_rebuild": "Reconstruirla",
    "ed_rebuilt": "Casa reconstruida en su sitio",
    "f3_on": "Muebles en 3D",
    "f3_tip": "El plano tal como está dibujado, con los muebles en 3D, iluminados y con sombras",
    "st_kitchens": "Cocinas",
    "st_livings": "Salas de estar",
    "st_offices": "Despachos",
    "st_laundries": "Lavaderos",
    "st_room_n": "{room} {n}",
    "st_typed": "Escribe un número de {from} a {to}, o usa los botones",
    "st_open": "Empezar a construir",
    "st_open_tip": "Crear una casa amueblada, apartamentos, condominios o una tienda con unas pocas opciones",
    "ty_condos": "Condominios",
    "ty_condos_side": "Condominios por lado",
    "ty_condo_n": "Unidad {n}",
    "tr_gym": "Gimnasio",
    "yd_head": "Jardín",
    "yd_deck": "Terraza",
    "yd_porch": "Porche",
    "yd_pool": "Piscina",
    "yd_hottub": "Jacuzzi",
    "yd_grill": "Parrilla",
    "yd_firepit": "Fogata",
    "yd_trampoline": "Cama elástica",
    "yd_swing": "Columpios",
    "yd_gazebo": "Cenador",
    "yd_court": "Cancha de baloncesto",
    "yd_pavilion": "Pabellón",
    "yd_fence": "Valla del jardín",
    "yd_shed": "Caseta",
    "yd_garden": "Huerto",
    "yd_no_room": "No hay sitio en el jardín",
    "wk_plan": "Distribuyendo las habitaciones",
    "wk_furnish": "Amueblando",
    "wk_extras": "Unos detalles más",
    "wk_windows": "Ventanas y puertas",
    "wk_decor": "Últimos retoques",
    "wk_wire": "Instalación eléctrica",
    "wk_arrange": "Colocando los muebles",
    "wk_yard": "El jardín",
    "wk_draw": "Dibujando",
    "wk_land": "El terreno y la calle",
    "wk_house": "Levantando las paredes",
    "wk_models": "Haciendo los muebles",
    "wk_scene": "La luz",
    "wk_stop": "Parar",
    "wk_stopped": "Parado: como estaba",
    "wb_out": "Abrir en una pestaña nueva",
    "wb_big": "Más grande",
    "wb_small": "Más pequeño",
    "wb_loading": "Cargando…",
    "wb_slow": "Sigue cargando. Puede que este sitio no se deje mostrar dentro de otra página; ábrelo en una pestaña nueva.",
    "wb_note": "Algunos sitios web no se muestran dentro de otra página. Ábrelos en una pestaña nueva.",
    "wb_opened": "Abierto {url}",
    "wb_bad": "Eso no es una dirección web: {what}",
    "dg_head": "Diseño",
    # the kinds of tree, shrub, flower bed and hedge, their groups (40-flora.js)
    "spc_head": "Tipo",
    "spc_head_i_tree": "Tipo de árbol",
    "spc_head_i_shrub": "Tipo de arbusto",
    "spc_head_i_flowerbed": "Qué se planta",
    "spc_head_i_hedge": "Tipo de seto",
    "spc_count": "{n} tipos",
    "spg_here": "Crece aquí",
    "spg_shade": "Sombra",
    "spg_flower": "Con flor",
    "spg_fruit": "Frutales",
    "spg_conifer": "Coníferas",
    "spg_palm": "Palmeras",
    "spg_dry": "Secano",
    "spg_ever": "Perennes",
    "spg_bloom": "Con flor",
    "spg_topiary": "Topiaria",
    "spg_herb": "Hierbas",
    "spg_grass": "Hierbas y helechos",
    "spg_bed": "Variadas",
    "spg_spring": "Primavera",
    "spg_summer": "Verano",
    "spg_edible": "Huerto y rocas",
    "spg_hedge": "Setos",
    "spc_broad": "Árbol de sombra",
    "spc_oak": "Roble",
    "spc_maple": "Arce",
    "spc_redmaple": "Arce rojo",
    "spc_birch": "Abedul",
    "spc_beech": "Haya",
    "spc_copperbeech": "Haya roja",
    "spc_elm": "Olmo",
    "spc_ash": "Fresno",
    "spc_linden": "Tilo",
    "spc_chestnut": "Castaño de Indias",
    "spc_plane": "Plátano de sombra",
    "spc_willow": "Sauce llorón",
    "spc_aspen": "Álamo temblón",
    "spc_poplar": "Álamo",
    "spc_ginkgo": "Ginkgo",
    "spc_liveoak": "Encino de Virginia",
    "spc_eucalyptus": "Eucalipto",
    "spc_cherry": "Cerezo en flor",
    "spc_weepingcherry": "Cerezo llorón",
    "spc_magnolia": "Magnolio",
    "spc_dogwood": "Cornejo",
    "spc_redbud": "Ciclamor",
    "spc_crabapple": "Manzano silvestre",
    "spc_jacaranda": "Jacarandá",
    "spc_flametree": "Flamboyán",
    "spc_frangipani": "Frangipani",
    "spc_crapemyrtle": "Árbol de Júpiter",
    "spc_jmaple": "Arce japonés",
    "spc_fruit": "Árbol frutal",
    "spc_apple": "Manzano",
    "spc_pear": "Peral",
    "spc_orange": "Naranjo",
    "spc_lemon": "Limonero",
    "spc_olive": "Olivo",
    "spc_fig": "Higuera",
    "spc_walnut": "Nogal",
    "spc_mango": "Mango",
    "spc_spruce": "Pícea",
    "spc_bluespruce": "Pícea azul",
    "spc_fir": "Abeto",
    "spc_pine": "Pino",
    "spc_scotspine": "Pino silvestre",
    "spc_stonepine": "Pino piñonero",
    "spc_cedar": "Cedro",
    "spc_hemlock": "Tsuga",
    "spc_larch": "Alerce",
    "spc_redwood": "Secuoya",
    "spc_cypress": "Ciprés",
    "spc_arborvitae": "Tuya",
    "spc_junipertree": "Enebro arbóreo",
    "spc_yew": "Tejo",
    "spc_palm": "Cocotero",
    "spc_datepalm": "Palmera datilera",
    "spc_fanpalm": "Palmera de abanico",
    "spc_royalpalm": "Palma real",
    "spc_banana": "Platanera",
    "spc_bamboo": "Bambú",
    "spc_treefern": "Helecho arbóreo",
    "spc_joshua": "Árbol de Josué",
    "spc_cactus": "Cactus saguaro",
    "spc_paloverde": "Palo verde",
    "spc_mesquite": "Mezquite",
    "spc_acacia": "Acacia",
    "spc_baobab": "Baobab",
    "spc_dragontree": "Drago",
    "spc_bush": "Arbusto",
    "spc_boxwood": "Boj",
    "spc_holly": "Acebo",
    "spc_juniper": "Enebro rastrero",
    "spc_barberry": "Agracejo",
    "spc_mugo": "Pino mugo",
    "spc_topball": "Topiaria en bola",
    "spc_topcone": "Topiaria en cono",
    "spc_topspiral": "Topiaria en espiral",
    "spc_hydrangea": "Hortensia azul",
    "spc_hydrangeapink": "Hortensia rosa",
    "spc_azalea": "Azalea",
    "spc_rhododendron": "Rododendro",
    "spc_camellia": "Camelia",
    "spc_gardenia": "Gardenia",
    "spc_hibiscus": "Hibisco",
    "spc_bougainvillea": "Buganvilla",
    "spc_heather": "Brezo",
    "spc_lilac": "Lila",
    "spc_oleander": "Adelfa",
    "spc_forsythia": "Forsitia",
    "spc_rose": "Rosal rojo",
    "spc_rosepink": "Rosal rosa",
    "spc_rosewhite": "Rosal blanco",
    "spc_lavender": "Lavanda",
    "spc_rosemary": "Romero",
    "spc_yucca": "Yuca",
    "spc_agave": "Agave",
    "spc_aloe": "Aloe",
    "spc_succulents": "Suculentas",
    "spc_pampas": "Hierba de las pampas",
    "spc_fountaingrass": "Pennisetum",
    "spc_hosta": "Hosta",
    "spc_fern": "Helecho",
    "spc_birdofparadise": "Ave del paraíso",
    "spc_mixed": "Flores variadas",
    "spc_tulips": "Tulipanes",
    "spc_bluebells": "Jacintos silvestres",
    "spc_pansies": "Pensamientos",
    "spc_daisies": "Margaritas",
    "spc_sunflowers": "Girasoles",
    "spc_roses": "Rosaleda",
    "spc_lavenderbed": "Lavandas",
    "spc_marigolds": "Caléndulas",
    "spc_peonies": "Peonías",
    "spc_lilies": "Lirios",
    "spc_irises": "Iris",
    "spc_poppies": "Amapolas",
    "spc_petunias": "Petunias",
    "spc_geraniums": "Geranios",
    "spc_zinnias": "Zinnias",
    "spc_dahlias": "Dalias",
    "spc_snapdragons": "Bocas de dragón",
    "spc_foxgloves": "Dedaleras",
    "spc_coneflowers": "Equináceas",
    "spc_blackeyedsusans": "Rudbeckias",
    "spc_wildflowers": "Flores silvestres",
    "spc_vegetables": "Huerto",
    "spc_rockgarden": "Jardín de rocas",
    "spc_privet": "Seto de aligustre",
    "spc_boxhedge": "Seto bajo de boj",
    "spc_laurel": "Seto de laurel",
    "spc_hollyhedge": "Seto de acebo",
    "spc_yewhedge": "Seto de tejo",
    "spc_thuja": "Seto de tuya",
    "spc_beechhedge": "Seto de haya",
    "spc_flowerhedge": "Seto florido",
    "dg_count": "{n} diseños",
    "dg_colorway": "Colores",
    "dg_find": "Buscar en {n} objetos y {d} diseños",
    "dg_classic": "Clásico",
    "dg_modern": "Moderno",
    "dg_midcentury": "Mid-century",
    "dg_scandi": "Escandinavo",
    "dg_industrial": "Industrial",
    "dg_farmhouse": "Rústico de granja",
    "dg_glam": "Glamour",
    "dg_coastal": "Costero",
    "dg_rustic": "Rústico",
    "dg_japandi": "Japandi",
    "dg_artdeco": "Art déco",
    "dg_boho": "Boho",
    "dg_minimal": "Minimalista",
    "dg_traditional": "Tradicional",
    "dgf_stainless": "Acero inoxidable",
    "dgf_blackss": "Inoxidable negro",
    "dgf_white": "Blanco",
    "dgf_matte": "Negro mate",
    "dgf_retrocream": "Crema retro",
    "dgf_retromint": "Menta retro",
    "dgf_retrored": "Rojo retro",
    "dgf_bronze": "Bronce",
    "dgf_panel": "Panel de roble",
    "dgf_black": "Negro",
    "dgf_silver": "Plata",
    "dgf_walnut": "Nogal",
    "dgf_graphite": "Grafito",
    "dgf_terracotta": "Terracota",
    "dgf_matteblack": "Negro mate",
    "dgf_woven": "Trenzado",
    "dgf_concrete": "Hormigón",
    "dgf_glazedblue": "Azul esmaltado",
    "dgf_brass": "Latón",
    "dgf_sage": "Salvia",
    "dgf_cedar": "Cedro",
    "dgf_teak": "Teca",
    "dgf_blackmetal": "Metal negro",
    "dgf_composite": "Composite",
    "dgf_stone": "Piedra",
    "dgf_green": "Verde",
    "dgf_redbarn": "Rojo granero",
    "dgc_cream": "Crema",
    "dgc_sage": "Salvia",
    "dgc_navy": "Marino",
    "dgc_grey": "Gris",
    "dgc_charcoal": "Antracita",
    "dgc_white": "Blanco",
    "dgc_mustard": "Mostaza",
    "dgc_teal": "Verde azulado",
    "dgc_rust": "Óxido",
    "dgc_oat": "Avena",
    "dgc_fog": "Niebla",
    "dgc_blush": "Rosa palo",
    "dgc_cognac": "Coñac",
    "dgc_black": "Negro",
    "dgc_olive": "Oliva",
    "dgc_linen": "Lino",
    "dgc_oak": "Roble",
    "dgc_blue": "Azul",
    "dgc_emerald": "Esmeralda",
    "dgc_sapphire": "Zafiro",
    "dgc_sand": "Arena",
    "dgc_seafoam": "Verde mar",
    "dgc_saddle": "Cuero",
    "dgc_barn": "Granero",
    "dgc_moss": "Musgo",
    "dgc_ash": "Fresno",
    "dgc_clay": "Arcilla",
    "dgc_jade": "Jade",
    "dgc_plum": "Ciruela",
    "dgc_ivory": "Marfil",
    "dgc_terracotta": "Terracota",
    "dgc_ochre": "Ocre",
    "dgc_stone": "Piedra",
    "dgc_burgundy": "Burdeos",
    "dgc_hunter": "Verde cazador",
    "dgc_gold": "Oro",
    "sy_head": "Estilo",
    "sy_plain": "Sencillo",
    "sy_plain_sub": "Sin estilo concreto",
    "sy_change": "Cambiar",
    "sy_applied": "Estilo {name}",
    "sy_r_americas": "América",
    "sy_r_europe": "Europa",
    "sy_r_asia": "Asia",
    "sy_r_mideast": "Oriente Medio y África",
    "sy_r_oceania": "Australia y Nueva Zelanda",
    "sy_r_modern": "Moderno",
    "sy_r_civic": "Ciudades",
    "sy_suggested": "Sugeridos",
    "sy_all": "Todos",
    "sy_find": "Buscar un estilo",
    "sy_any": "Cualquiera (Otra)",
    "sy_none": "Ningún estilo con ese nombre",
    "sy_international": "Estilo internacional",
    "sy_brutalist": "Brutalista",
    "sy_artdeco": "Art déco",
    "sy_storefront": "Calle comercial",
    "sy_haussmann": "Haussmann (París)",
    "sy_brownstone": "Brownstone",
    "sy_bistro": "Café parisino",
    "sy_googie": "Diner Googie",
    "sy_collegiate": "Gótico colegial",
    "sy_schoolhouse": "Escuela roja",
    "sy_modernist": "Modernista",
    "sy_hightech": "High-tech",
    "sy_panelblock": "Bloque de paneles",
    "sy_mediterranean": "Mediterráneo",
    "sy_scandi": "Escandinavo",
    "sy_craftsman": "Craftsman",
    "sy_colonial": "Colonial",
    "sy_capecod": "Cape Cod",
    "sy_victorian": "Victoriano",
    "sy_ranch": "Rancho",
    "sy_farmhouse": "Granja",
    "sy_dutchcolonial": "Colonial holandés",
    "sy_logcabin": "Cabaña de troncos",
    "sy_aframe": "Casa en A",
    "sy_midcentury": "Mid-century",
    "sy_prairie": "Pradera",
    "sy_pueblo": "Adobe pueblo",
    "sy_mission": "Misión española",
    "sy_brazil": "Moderno brasileño",
    "sy_tudor": "Tudor",
    "sy_georgian": "Georgiano",
    "sy_cottage": "Casita con tejado de paja",
    "sy_french": "Mansarda parisina",
    "sy_provencal": "Provenzal",
    "sy_tuscan": "Villa toscana",
    "sy_dutch": "Casa de canal holandesa",
    "sy_nordic": "Escandinavo",
    "sy_chalet": "Chalet suizo",
    "sy_izba": "Isba rusa",
    "sy_cycladic": "Isla griega",
    "sy_japanese": "Japonés",
    "sy_chinese": "Patio chino",
    "sy_hanok": "Hanok coreano",
    "sy_thai": "Tailandés",
    "sy_balinese": "Balinés",
    "sy_haveli": "Haveli indio",
    "sy_riad": "Riad marroquí",
    "sy_arabian": "Árabe con cúpula",
    "sy_sahel": "Adobe del Sahel",
    "sy_rondavel": "Rondavel",
    "sy_queenslander": "Queenslander",
    "sy_nzvilla": "Villa neozelandesa",
    "sy_modern": "Movimiento moderno",
    "sy_contemporary": "Contemporáneo",
    "sy_ecohouse": "Casa ecológica",
    "rf_head": "Forma del tejado",
    "rf_hip": "A cuatro aguas",
    "rf_gable": "A dos aguas",
    "rf_flat": "Plano",
    "rf_slab": "Voladizo",
    "rf_mansard": "Mansarda",
    "rf_gambrel": "Holandés",
    "rf_aframe": "En A",
    "rf_shed": "A un agua",
    "rf_butterfly": "Mariposa",
    "rf_pagoda": "Curvo",
    "rf_dome": "Cúpula",
    "rf_stepped": "Escalonado",
    "ty_head": "Qué construir",
    "ty_what_head": "Qué tiene",
    "ty_house": "Casa",
    "ty_cabin": "Cabaña",
    "ty_townhouses": "Casas adosadas",
    "ty_duplex": "Dúplex",
    "ty_apartments": "Apartamentos",
    "ty_shop": "Supermercado",
    "ty_boutique": "Tienda de ropa",
    "ty_cafe": "Cafetería",
    "ty_office": "Oficina",
    "ty_school": "Escuela",
    "ty_units": "Casas en la hilera",
    "ty_storeys": "Plantas",
    "ty_flats_side": "Apartamentos por lado",
    "ty_flat_beds": "Dormitorios cada uno",
    "ty_classrooms": "Aulas por planta",
    "ty_size": "Tamaño",
    "ty_small": "Pequeño",
    "ty_medium": "Mediano",
    "ty_large": "Grande",
    "ty_style_prev": "Estilo anterior",
    "ty_style_next": "Estilo siguiente",
    "ty_home_n": "Casa {n}",
    "ty_flat_n": "Apto. {n}",
    "ty_class_n": "Aula {n}",
    "tr_lobby": "Vestíbulo",
    "tr_landing": "Rellano",
    "tr_lift": "Ascensor",
    "tr_sales": "Sala de ventas",
    "tr_stock": "Almacén",
    "tr_restroom": "Aseo",
    "tr_staff": "Sala del personal",
    "tr_fitting": "Probador",
    "tr_boutique": "Tienda",
    "tr_cafe": "Comedor",
    "tr_reception": "Recepción",
    "tr_openoffice": "Oficina abierta",
    "tr_meeting": "Sala de reuniones",
    "tr_kitchenette": "Office",
    "tr_classroom": "Aula",
    "tk_head": "Qué vende",
    "tk_grocery": "Alimentación",
    "tk_convenience": "Tienda 24 h",
    "tk_pharmacy": "Farmacia",
    "tk_hardware": "Ferretería",
    "tk_electronics": "Electrónica",
    "tk_books": "Libros",
    "tk_furniture": "Muebles",
    "tk_florist": "Flores",
    "tk_toys": "Juguetes",
    "tk_sports": "Deportes",
    "tk_pets": "Mascotas",
    "tk_floor_convenience": "Tienda",
    "tk_floor_pharmacy": "Farmacia",
    "tk_floor_hardware": "Ferretería",
    "tk_floor_electronics": "Tienda de electrónica",
    "tk_floor_books": "Librería",
    "tk_floor_furniture": "Exposición",
    "tk_floor_florist": "Floristería",
    "tk_floor_toys": "Juguetería",
    "tk_floor_sports": "Tienda de deportes",
    "tk_floor_pets": "Tienda de mascotas",
    "pg_training": "Sala de formación",
    "pg_boardroom": "Sala de juntas",
    "pg_cubicles": "Cubículos",
    "pg_phone": "Cabina telefónica",
    "pg_directors": "Despacho de dirección",
    "pg_science_n": "Laboratorio {n}",
    "pg_computers_n": "Sala de informática {n}",
    "pg_art_n": "Aula de arte {n}",
    "pg_music_n": "Aula de música {n}",
    "pg_math_n": "Matemáticas {n}",
    "pg_english_n": "Inglés {n}",
    "pg_history_n": "Historia {n}",
    "pg_library": "Biblioteca",
    "pg_cafeteria": "Comedor",
    "pg_nurse": "Enfermería",
    "pg_labbench": "Mesa de laboratorio",
    "pg_worktable": "Mesa de trabajo",
    "tr_breakout": "Zona de descanso",
    "tr_school_office": "Secretaría",
    "ty_together": "Las casas en hilera siempre van juntas",
    "ty_start_title": "Empezar un edificio",
    "ty_make": "Crearlo",
    "tr_office": "Oficina",
    "wx_clear": "Despejado",
    "wx_cloudy": "Nublado",
    "wx_rain": "Lluvia",
    "wx_storm": "Tormenta",
    "wx_snow": "Nieve",
    "wx_fog": "Niebla",
    "wx_says_rain": "25 mm de lluvia sobre este tejado son unos {l} litros de agua.",
    "wx_gutters": "Los canalones lo bajan por las bajantes, lejos de las paredes.",
    "wx_no_gutters": "Sin canalones cae desde el alero junto a las paredes.",
    "wx_says_snow": "30 cm de nieve húmeda sobre este tejado pesan unos {kg} kg.",
    "wx_says_rain_ft": "Una pulgada de lluvia sobre este tejado son unos {gal} galones de agua.",
    "wx_says_snow_ft": "Un pie de nieve húmeda sobre este tejado pesa unas {lb} lb.",
    "land_head": "El terreno",
    "land_guess": "El terreno mínimo para esta casa, con los retiros habituales",
    "land_house": "Casa {ground} en planta · {all} construidos",
    "land_cover": "{n} % construido",
    "land_acres": "{n} acres",
    "land_ha": "{n} ha",
    "hs_floors": "Plantas y tejado",
    "hs_floors_tip": "Añadir una planta encima o un sótano, o cubrir la casa con un tejado de una pieza",
    "hs_floors_title": "Plantas y tejado",
    "hs_floors_sub": "Una planta nueva va junto a las otras en el papel, con la escalera unida a la de abajo; en 3D queda encima.",
    "hs_add": "Añadir",
    "hs_add_up": "Una planta encima",
    "hs_add_down": "Un sótano",
    "hs_done": "Listo",
    "hs_floor_made": "{name} añadida",
    "dz_finish": "Acabado",
    "dz_fin_main": "Principal",
    "dz_fin_trim": "Detalles",
    "dz_fin_plain_tip": "Volver a los colores de siempre",
    "sizes": "Medidas",
    "sizes_tip": "Escribir en el plano el largo, el ancho y la altura del techo de cada habitación, y el ancho, el fondo y la altura de cada mueble",
    "ic_fitness": "Ejercicio y juego",
    "ic_utility": "Garaje y servicio",
    "ic_store": "Tiendas, oficinas y escuelas",
    "ic_power": "Electricidad y estructura",
    "n_i_consoletable": "Mesa consola",
    "n_i_sideboard": "Aparador",
    "n_i_chaise": "Chaise longue",
    "n_i_rocker": "Mecedora",
    "n_i_hutch": "Vitrina",
    "n_i_barcart": "Carrito de bar",
    "n_i_highchair": "Trona",
    "n_i_daybed": "Diván cama",
    "n_i_floormirror": "Espejo de pie",
    "n_i_toybox": "Baúl de juguetes",
    "n_i_standdesk": "Escritorio de pie",
    "n_i_lshapedesk": "Escritorio en L",
    "n_i_oven": "Horno de pared",
    "n_i_winecooler": "Vinoteca",
    "n_i_freezer": "Congelador horizontal",
    "n_i_cornertub": "Bañera de esquina",
    "n_i_linencab": "Armario de ropa blanca",
    "n_i_whiteboard": "Pizarra blanca",
    "n_i_dartboard": "Diana",
    "n_i_evcharger": "Cargador de coche",
    "n_i_treadmill": "Cinta de correr",
    "n_i_exbike": "Bicicleta estática",
    "n_i_weightbench": "Banco de pesas",
    "n_i_yogamat": "Esterilla de yoga",
    "n_i_pooltable": "Mesa de billar",
    "n_i_pingpong": "Mesa de ping-pong",
    "n_i_easel": "Caballete",
    "n_i_trampoline": "Cama elástica",
    "n_i_swing": "Columpio",
    "n_i_firepit": "Fogata",
    "n_i_lounger": "Tumbona",
    "n_i_gazebo": "Cenador",
    "n_i_shed": "Caseta de jardín",
    "n_i_planter": "Jardinera",
    "n_i_birdbath": "Bebedero para pájaros",
    "n_i_lamppost": "Farola",
    "n_i_pathlight": "Baliza de jardín",
    "n_i_porchlight": "Farol de pared",
    "n_i_floodlight": "Foco exterior",
    "n_i_mailbox": "Buzón",
    "n_i_bikerack": "Aparcabicicletas",
    "n_i_court": "Cancha de baloncesto",
    "n_i_pavilion": "Pabellón",
    "n_i_parking": "Estacionamiento",
    "n_i_dumpster": "Contenedor de basura",
    "n_i_condenser": "Unidad exterior del aire acondicionado",
    "n_i_bins": "Cubos de basura y reciclaje",
    "n_i_gate": "Puerta de valla",
    "n_i_workbench": "Banco de trabajo",
    "n_i_shelving": "Estantería",
    "n_i_toolchest": "Carro de herramientas",
    "n_i_furnace": "Caldera",
    "n_i_gondola": "Góndola",
    "n_i_checkout": "Caja",
    "n_i_cooler": "Nevera expositora",
    "n_i_display": "Mesa expositora",
    "n_i_register": "Caja registradora",
    "n_i_schooldesk": "Pupitre",
    "n_i_outlet": "Enchufe",
    "n_i_lightswitch": "Interruptor",
    "n_i_garagebtn": "Botón de la puerta del garaje",
    "n_i_breaker": "Cuadro eléctrico",
    "n_i_post": "Pilar",
    "wk_i_consoletable": "deja las llaves en la consola",
    "wk_i_sideboard": "saca la vajilla buena",
    "wk_i_chaise": "se tumba en la chaise longue",
    "wk_i_rocker": "se mece en la mecedora",
    "wk_i_hutch": "admira la vajilla",
    "wk_i_barcart": "prepara una bebida",
    "wk_i_highchair": "da de comer al bebé",
    "wk_i_daybed": "se recuesta un rato",
    "wk_i_floormirror": "se mira el conjunto",
    "wk_i_toybox": "guarda los juguetes",
    "wk_i_standdesk": "trabaja de pie",
    "wk_i_lshapedesk": "trabaja en el escritorio en L",
    "wk_i_oven": "hornea un pastel",
    "wk_i_winecooler": "elige una botella de vino",
    "wk_i_freezer": "saca algo del congelador",
    "wk_i_cornertub": "se da un baño largo",
    "wk_i_linencab": "coge una toalla limpia",
    "wk_i_whiteboard": "escribe en la pizarra",
    "wk_i_dartboard": "lanza unos dardos",
    "wk_i_evcharger": "enchufa el coche",
    "wk_i_treadmill": "sale a correr en la cinta",
    "wk_i_exbike": "pedalea en la bicicleta estática",
    "wk_i_weightbench": "levanta pesas",
    "wk_i_yogamat": "hace yoga",
    "wk_i_pooltable": "juega al billar",
    "wk_i_pingpong": "juega al ping-pong",
    "wk_i_easel": "pinta un cuadro",
    "wk_i_trampoline": "salta en la cama elástica",
    "wk_i_swing": "se columpia",
    "wk_i_firepit": "enciende la fogata",
    "wk_i_lounger": "toma el sol",
    "wk_i_gazebo": "se sienta en el cenador",
    "wk_i_shed": "saca el cortacésped",
    "wk_i_planter": "riega la jardinera",
    "wk_i_birdbath": "llena el bebedero",
    "wk_i_lamppost": "enciende la farola",
    "wk_i_pathlight": "enciende la baliza",
    "wk_i_porchlight": "enciende el farol",
    "wk_i_floodlight": "enciende el foco",
    "wk_i_mailbox": "mira el buzón",
    "wk_i_bikerack": "coge la bicicleta",
    "wk_i_court": "tira unas canastas",
    "wk_i_pavilion": "hace un pícnic en el pabellón",
    "wk_i_dumpster": "lleva la basura al contenedor",
    "wk_i_condenser": "revisa el aire acondicionado",
    "wk_i_bins": "saca la basura",
    "wk_i_gate": "deja pasar a través de la valla",
    "wk_i_workbench": "arregla algo en el banco de trabajo",
    "wk_i_shelving": "busca una caja en la estantería",
    "wk_i_toolchest": "coge una llave inglesa",
    "wk_i_furnace": "sube la calefacción",
    "wk_i_gondola": "coge algo de la estantería",
    "wk_i_checkout": "paga en la caja",
    "wk_i_cooler": "saca una bebida fría",
    "wk_i_display": "elige algo de fruta",
    "wk_i_register": "lo cobra",
    "wk_i_schooldesk": "se sienta para la clase",
    "wk_i_outlet": "enchufa algo",
    "wk_i_lightswitch": "pulsa el interruptor",
    "wk_i_garagebtn": "pulsa el botón de la puerta del garaje",
    "wk_i_breaker": "revisa los automáticos",
    "wk_i_post": "se apoya en el pilar",
    # ---- doors, as they are made (40-doors.js, 2026-10-03)
    "dd_head": "Puerta",
    "dd_handle": "Manija",
    "dd_metal": "Herrajes",
    "dd_finish": "Acabado",
    "dd_hinges": "Bisagras",
    "dd_left": "Izquierda",
    "dd_right": "Derecha",
    "dd_opens": "Abre hasta",
    "dd_st_flush": "Lisa",
    "dd_st_panel6": "Seis paneles",
    "dd_st_panel2": "Dos paneles",
    "dd_st_shaker": "Shaker",
    "dd_st_craftsman": "Craftsman",
    "dd_st_halfglass": "Media vidriera",
    "dd_st_french": "Francesa",
    "dd_st_modern": "Moderna",
    "dd_st_barn": "Granero",
    "dd_st_louver": "Persiana",
    "dd_st_storefront": "Escaparate",
    "dd_hd_lever": "Palanca",
    "dd_hd_knob": "Pomo",
    "dd_hd_pull": "Tirador",
    "dd_mt_brass": "Latón",
    "dd_mt_chrome": "Cromo",
    "dd_mt_black": "Negro mate",
    "dd_mt_bronze": "Bronce",
    "dd_mt_nickel": "Níquel",
    "dd_fin_drawn": "Como está dibujada",
    "dd_fin_white": "Blanco",
    "dd_fin_oak": "Roble",
    "dd_fin_walnut": "Nogal",
    "dd_fin_black": "Negro",
    "dd_fin_sage": "Salvia",
    "dd_fin_navy": "Azul marino",
    "dd_fin_red": "Rojo",
    "dd_ajar": "Entreabierta",
    "dd_wide": "Abierta",
    "dd_shut": "Cerrada",
    # ---- going between floors, walking round (40-climb.js, 2026-10-03)
    "lf_panel": "Botones del ascensor",
    "lf_going": "Cerrando puertas",
    "lf_here": "{floor}",
    "lf_called": "Ascensor aquí",
    # ---- what is done, seen being done (40-use3d.js, 2026-10-03)
    "us_plugged": "Enchufado: {what}",
    "us_plugged_none": "Enchufado",
    "us_unplugged": "Desenchufado: {what}",
    "us_unplugged_none": "Desenchufado",
    # ---- moving things about in 3D (40-edit3d.js, 2026-10-03)
    "e3_back": "No cabe ahí: devuelto",
    "e3_turn": "Girar",
    "e3_turn_tip": "Girar un cuarto de vuelta (R)",
    "e3_delete": "Borrar",
    "e3_delete_tip": "Quitarlo (Supr)",
    "e3_done": "Listo",
    "e3_no_turn": "No hay sitio para girarlo",
    "e3_deleted": "{what} quitado",
    "e3_undone": "Deshecho",
    "e3_redone": "Rehecho",
    # ---- opened the way it is made, used by looking at it (40-open3d.js, 2026-10-03)
    "o3_closer": "Acércate más",
    "o3_open_drawer": "Abrir el cajón", "o3_close_drawer": "Cerrar el cajón",
    "o3_open_door": "Abrir la puerta", "o3_close_door": "Cerrar la puerta",
    # the garage door, its opener and its button (40-garage.js)
    "gd_use_button": "Funciona con su motor: usa el botón de la pared", "gd_door_verb": "Usa el botón de la pared",
    "gd_open": "Abrir la puerta del garaje", "gd_close": "Cerrar la puerta del garaje", "gd_stop": "Detener la puerta del garaje",
    "gd_opening": "La puerta del garaje se abre", "gd_closing": "La puerta del garaje se cierra", "gd_stopped": "Puerta del garaje detenida",
    "gd_eye": "El sensor de seguridad la hizo subir de nuevo", "gd_no_door": "No hay puerta de garaje para este botón",
    "gd_cars_head": "Garaje", "gd_cars_1": "1 coche", "gd_cars_2": "2 coches", "gd_cars_3": "3 coches", "gd_cars_4": "4 coches",
    "fm_foyer": "Recibidor",   # a house entered by an entry hall (40-forms.js)
    "wg_ready": "Preparando la obra",   # the building site held at its start while it loads (40-works-gate.js)
    "gl_wait": "Preparando la vista 3D",   # the 3D view's programs made on the side, the first time it is drawn (38-view3d-gl.js)
    "ro_coming": "Recuperando el trabajo…",   # over the paper while the work left on it is put back (40-reopen.js)
    "wv_units": "d h m s",   # days, hours, minutes, seconds: the build video's times (40-works-video.js)
    "uf_head": "Muebles",   # Start building: furnished or empty (39-starter.js)
    "uf_tile": "Amueblar las habitaciones",
    "o3_open_lid": "Levantar la tapa", "o3_close_lid": "Cerrar la tapa",
    "o3_locked": "Cerrado con llave",
    "o3_light_on": "Encender la luz", "o3_light_off": "Apagar la luz",
    "o3_breakers_on": "Volver a dar la corriente", "o3_breakers_off": "Cortar la corriente",
    "o3_turn_on": "Encender", "o3_turn_off": "Apagar",
    "o3_tap_on": "Abrir el grifo", "o3_tap_off": "Cerrar el grifo",
    "o3_fire_on": "Encender el fuego", "o3_fire_off": "Apagar el fuego",
    "o3_sit": "Sentarte", "o3_lie": "Acostarte", "o3_sleep": "Dormir hasta la mañana",
    "o3_plug": "Enchufar", "o3_unplug": "Desenchufar",
    "o3_flush": "Tirar de la cadena", "o3_play": "Tocar", "o3_water_plant": "Regarla", "o3_take_book": "Coger un libro",
    "o3_pay": "Pagar", "o3_take": "Coger uno", "o3_coffee": "Hacer un café", "o3_workout": "Hacer ejercicio",
    "o3_game": "Jugar una partida", "o3_fish": "Dar de comer a los peces", "o3_music": "Poner música", "o3_write": "Escribir en ella",
    "o3_car": "Probar la puerta", "o3_swim": "Darte un baño", "o3_test": "Probarla", "o3_warmer": "Subir la temperatura",
    "o3_use": "Usar",
    "o3_opened": "{what}: abriste {part}", "o3_closed": "{what}: cerraste {part}",
    "o3_p_drawer": "el cajón", "o3_p_door": "la puerta", "o3_p_lid": "la tapa",
    "o3_m_move": "Mover", "o3_m_open": "Abrir", "o3_m_close": "Cerrar", "o3_m_use": "Usar",
    "o3_m_format": "Acabado y diseño…", "o3_m_place": "Haz clic donde vaya · Esc lo deja",
    "o3_no_room": "No hay sitio al lado", "o3_made": "Otro más: {what}",
    # ---- round a building, for what it is (40-grounds.js, 2026-10-03)
    "gr_head": "Exteriores",
    "gr_tab_building": "Edificio",
    "gr_building": "El edificio",
    "yd_parking": "Aparcamiento",
    "yd_bikes": "Aparcabicis",
    "yd_benches": "Bancos",
    "yd_lamps": "Farolas",
    "yd_planters": "Jardineras",
    "yd_seating": "Mesas fuera",
    "yd_playground": "Parque infantil",
    "yd_sharedpool": "Piscina y tumbonas",
    "yd_bbq": "Zona de barbacoa",
    "yd_carts": "Carritos",
    # ---- how open a house is (39-starter.js, 2026-10-03)
    "st_layout_head": "Distribución",
    "lay_classic": "Estancias separadas",
    "lay_semi": "Cocina y comedor juntos",
    "lay_open": "Concepto abierto",
    "lay_great": "Gran salón",
    "sup_head": "Sostenida por",
    "sup_beams": "Vigas de acero",
    "sup_posts": "Postes",
    "zn_head": "Distribución",
    "zn_any": "Cualquiera (Otra)",
    "zn_together": "Dormitorios juntos",
    "zn_split": "Dormitorios separados",
    "zn_wing": "Ala de dormitorios",
    "zn_downstairs": "Dormitorio principal abajo",
    "od_one": "Hacer una sola habitación",
    "od_own": "Hacerla una habitación aparte",
    "od_apart": "Separar en habitaciones",
    # ---- what holds a building up (40-struct.js, 2026-10-03)
    "sx_head": "Estructura",
    "sx_wood": "Entramado de madera",
    "sx_steel": "Estructura de acero",
    "sx_shown": "Vigas a la vista",
    # ---- up under the roof (40-attic.js, 2026-10-03)
    "at_head": "Ático",
    "at_flat": "Un tejado plano no tiene ático",
    "hh_head": "Chimeneas",
    "hh_none": "Ninguna",
    "hh_one": "Una",
    "hh_each": "Una en cada vivienda",
    "ca_court": "Patio",
    "ca_commons": "Zona común",
    "ca_gym": "Gimnasio",
    "sl_girls": "Niñas",
    "sl_boys": "Niños",
    "sl_women": "Mujeres",
    "sl_men": "Hombres",
    "sl_accessible": "Cabina accesible",
    "at_none": "Ninguno",
    "at_storage": "Trastero",
    "at_room": "Sala acabada",
    "at_garage_head": "Sobre el garaje",
    "atg_none": "Nada",
    "atg_storage": "Trastero",
    "atg_room": "Sala extra",
    "at_room_name": "Sala del ático",
    "at_store_name": "Desván",
    "at_bonus_name": "Sala extra",
    "at_garage_name": "Altillo",
    "at_shed_loft": "Altillos en cobertizos",
    "fl_attic": "Ático",
    # ---- a house's systems, the parts of them (40-systems.js, 2026-10-03)
    "n_i_smoke": "Detector de humo",
    "n_i_thermostat": "Termostato",
    "n_i_waterheater": "Calentador de agua",
    "n_i_exhaustfan": "Extractor de baño",
    "wk_i_smoke": "prueba la alarma",
    "wk_i_thermostat": "sube la calefacción",
    "wk_i_waterheater": "revisa el calentador",
    "wk_i_exhaustfan": "enciende el extractor",
    # ---- a house's systems, set and seen (40-systems.js, 2026-10-03)
    "xr_insulation": "Aislamiento",
    "xr_fire": "Rociadores",
    "fs_exit": "SALIDA",
    "xr_low": "Datos, TV y alarmas",
    "xs_15": "15 A",
    "xs_20": "20 A",
    "xs_30": "30 A",
    "xs_50": "50 A",
    "xs_ground": "Pica de tierra",
    "xs_media": "Caja de red",
    "xs_shutoff": "Llave de paso",
    "xs_condenser": "Unidad exterior",
    "xs_return": "Retorno de aire",
    "dy_head": "Electricidad, fontanería, calefacción",
    "dy_auto": "Automático",
    "dy_diy": "Hazlo tú",
    "dy_fix": "Poner uno",
    "dy_no_panel": "La casa no tiene cuadro eléctrico",
    "dy_no_outlet": "No hay enchufe en {room}",
    "dy_no_switch": "No hay interruptor en {room}",
    "dy_no_smoke": "{room} necesita un detector de humo",
    "dy_no_fan": "{room} necesita un extractor al exterior",
    "dy_no_vent": "No hay calefacción en {room}",
    "dy_no_heater": "Nada calienta el agua",
    "dy_no_thermo": "No hay termostato para la calefacción",
    # ---- skyscrapers (40-towers.js, 2026-10-03)
    "ty_tower": "Rascacielos",
    "sk_lobby": "Vestíbulo",
    "sk_sky": "Mirador",
    "sk_use_head": "Uso",
    "sk_offices": "Oficinas",
    "sk_homes": "Viviendas",
    "sk_mixed": "Oficinas y viviendas",
    "sk_liftlobby": "Vestíbulo de ascensores",
    "sk_riser": "Patinillo",
    "sk_mailroom": "Sala de correo",
    "sk_security": "Seguridad",
    "sk_loading": "Muelle de carga",
    "sk_lounge": "Sala de estar",
    "sk_refuge": "Zona de refugio",
    "sk_plant": "Sala de máquinas",
    "sk_skylobby": "Vestíbulo elevado",
    "sk_service": "Montacargas",
    "sk_form_head": "Estilo de rascacielos",
    "sk_spire": "Escalonado en espiral",
    "sk_twist": "Torsionado",
    "sk_pagoda": "Pagoda",
    "sk_deco": "Art déco",
    "sk_diagrid": "Diagrid",
    "sk_star": "Planta en estrella",
    "sk_chamfer": "Achaflanado",
    "sk_taper": "Cuadrado a círculo",
    "sk_forest": "Bosque vertical",
    "sk_slab": "Prisma de vidrio",
    "shp_head": "Planta",
    "shp_box": "Esquinas rectas",
    "shp_rounded": "Esquinas redondeadas",
    "shp_angled": "Esquinas en chaflán",
    "shp_curved": "Fachada curva",
    "flow_paper_head": "En el papel",
    "flow_garage": "Necesita un garaje",
    "flow_beds": "Necesita dos dormitorios o más",
    "flow_not_tower": "Un rascacielos se hace a su manera",
    "flow_diy": "No si haces tú el cableado",
    "flow_homes": "Solo si tiene viviendas",
    # ---- using a house's systems (40-systems.js, 2026-10-03)
    "us_smoke": "¡Bip! ¡Bip! ¡Bip! La alarma funciona",
    "us_thermo": "Calefacción a {t}",
    # ---- more rooms for a house (40-rooms.js, 2026-10-03)
    "hx_head": "Más estancias",
    "hx_pantry": "Despensa",
    "hx_coat": "Armario de abrigos",
    "hx_mudroom": "Cuarto de botas",
    "hx_playroom": "Sala de juegos",
    "hx_media": "Sala de cine",
    "hx_gym": "Gimnasio",
    "hx_library": "Biblioteca",
    "hx_sunroom": "Solárium",
    # ---- the site round a building, joined or alone (40-site.js, 2026-10-03)
    "lw_attach_head": "Cómo se levanta",
    "lw_at_alone": "Aislado",
    "lw_at_one": "Adosado por un lado",
    "lw_at_row": "Adosado por ambos lados",
    "lw_at_block": "Parte de un gran edificio",
    "lw_park_head": "Estacionamiento",
    "lw_pk_auto": "Lo habitual",
    "lw_pk_drive": "Su propia entrada",
    "lw_pk_none": "Ninguno",
    "lw_pk_front": "Delante",
    "lw_pk_side": "Al lado",
    "lw_pk_frontside": "Delante y al lado",
    "lw_pk_back": "Detrás",
    "lw_pk_around": "Alrededor",
    "lw_pk_street": "En la calle",
    "lw_side_head": "Qué lado",
    "lw_sd_left": "Izquierda",
    "lw_sd_right": "Derecha",
    "lw_joined_tip": "Pegado al edificio de al lado",
    "yd_walks": "Aceras alrededor",
    "yd_beds": "Parterres y árboles",
    "n_i_sidewalk": "Acera",
    "n_i_asphalt": "Pavimento",
    "n_i_plantbed": "Parterre",
    "n_i_bikepark": "Aparcabicis",
    "lw_liftlobby": "Vestíbulo del ascensor",
    "ic_mall": "Centros comerciales y grandes tiendas",
    "n_i_cartcorral": "Corral de carritos",
    "n_i_selfcheckout": "Caja de autoservicio",
    "n_i_produce": "Puesto de frutas y verduras",
    "n_i_bakerycase": "Vitrina de panadería",
    "n_i_delicase": "Vitrina de charcutería",
    "n_i_meatcase": "Vitrina de carnes",
    "n_i_chestfreezer": "Congelador horizontal",
    "n_i_winerack": "Botellero",
    "n_i_magrack": "Revistero",
    "n_i_roundrack": "Perchero redondo",
    "n_i_mannequin": "Maniquí",
    "n_i_endcap": "Cabecera de góndola",
    "n_i_palletrack": "Estantería de palés",
    "n_i_forklift": "Carretilla elevadora",
    "n_i_pallet": "Palé de mercancía",
    "n_i_kiosk": "Quiosco",
    "n_i_atm": "Cajero automático",
    "n_i_vending": "Máquina expendedora",
    "n_i_photobooth": "Fotomatón",
    "n_i_mallfountain": "Fuente interior",
    "n_i_directory": "Directorio",
    "n_i_infodesk": "Mostrador de información",
    "n_i_secgate": "Arco antirrobo",
    "n_i_basketstack": "Cestas de compra",
    "n_i_pricecheck": "Verificador de precios",
    "n_i_servicedesk": "Atención al cliente",
    "n_i_cashwrap": "Mostrador de caja",
    "n_i_jewelcase": "Vitrina de joyería",
    "n_i_glasscase": "Vitrina de cristal",
    "n_i_lockers": "Taquillas",
    "n_i_kidride": "Atracción infantil",
    "n_i_claw": "Máquina de gancho",
    "n_i_arcade": "Máquina recreativa",
    "n_i_bin3": "Punto de reciclaje",
    "n_i_mallbench": "Banco",
    "n_i_bigplanter": "Jardinera con árbol",
    "ic_tower": "Rascacielos",
    "n_i_speedgate": "Torniquete de cristal",
    "n_i_featurewall": "Muro decorativo",
    "n_i_benchdesk": "Puestos en bench",
    "n_i_phonebooth": "Cabina insonorizada",
    "n_i_ahu": "Climatizadora",
    "n_i_chiller": "Enfriadora",
    "n_i_watertank": "Depósito de agua",
    "n_i_switchgear": "Cuadro eléctrico",
    "wk_i_benchdesk": "trabaja en un puesto bench",
    "wk_i_phonebooth": "atiende una llamada en la cabina",
    "wk_i_ahu": "revisa la climatizadora",
    "wk_i_chiller": "lee los indicadores de la enfriadora",
    "wk_i_watertank": "revisa el depósito de agua",
    "wk_i_switchgear": "revisa el cuadro eléctrico",
    "n_i_signpylon": "Tótem publicitario",
    "n_i_stanchion": "Postes separadores",
    "n_i_baler": "Compactadora de cartón",
    "n_i_escalator": "Escalera mecánica",
    "sto_big": "Gran superficie",
    "sto_super": "Hipermercado",
    "sto_garden": "Centro de jardinería",
    "sto_receiving": "Recepción de mercancía",
    "sto_dock": "Muelle de carga",
    "sto_cash": "Oficina de caja",
    "sto_backroom": "Almacén",
    "sto_grocery": "Alimentación",
    "sto_general": "Ropa y electrónica",
    "sto_home": "Hogar y bricolaje",
    "ty_mall": "Centro comercial",
    "mall_unit_n": "Local {n}",
    "mall_food": "Patio de comidas",
    "mall_anchor": "Gran almacén",
    "mall_entrance": "Entrada",
    "mall_concourse": "Galería",
    "ic_food": "Restaurantes y cafeterías",
    "ic_health": "Clínica y cuidados",
    "ic_hobby": "Música, arte y aficiones",
    "n_i_booth": "Reservado",
    "n_i_barcounter": "Barra de bar",
    "n_i_espresso": "Cafetera espresso",
    "n_i_pizzaoven": "Horno de pizza",
    "n_i_fryer": "Freidora",
    "n_i_griddle": "Plancha",
    "n_i_saladbar": "Bufé de ensaladas",
    "n_i_sodafountain": "Dispensador de refrescos",
    "n_i_menuboard": "Paneles de menú",
    "n_i_hoststand": "Atril de recepción",
    "n_i_buffet": "Bufé",
    "n_i_icecase": "Vitrina de helados",
    "n_i_beertap": "Grifo de cerveza",
    "n_i_preptable": "Mesa de preparación",
    "n_i_walkin": "Cámara frigorífica",
    "n_i_dishpro": "Lavavajillas industrial",
    "n_i_foodcounter": "Mostrador de comida",
    "n_i_foodtable": "Mesa de patio de comidas",
    "n_i_hospbed": "Cama de hospital",
    "n_i_exam": "Camilla de exploración",
    "n_i_wheelchair": "Silla de ruedas",
    "n_i_ivpole": "Portasueros",
    "n_i_xray": "Equipo de rayos X",
    "n_i_dentchair": "Sillón dental",
    "n_i_medcart": "Carro de medicación",
    "n_i_stretcher": "Camilla",
    "n_i_docscale": "Báscula médica",
    "n_i_eyechart": "Optotipo",
    "n_i_firstaid": "Botiquín",
    "n_i_aed": "Desfibrilador",
    "n_i_oxygen": "Bombonas de oxígeno",
    "n_i_walker": "Andador",
    "n_i_waitchairs": "Sillas de sala de espera",
    "n_i_grandpiano": "Piano de cola",
    "n_i_drums": "Batería",
    "n_i_guitar": "Guitarra",
    "n_i_cello": "Violonchelo",
    "n_i_keyboard": "Teclado",
    "n_i_micstand": "Pie de micrófono",
    "n_i_amp": "Amplificador",
    "n_i_sewing": "Máquina de coser",
    "n_i_pottery": "Torno de alfarero",
    "n_i_kiln": "Horno de cerámica",
    "n_i_chess": "Mesa de ajedrez",
    "n_i_drafting": "Mesa de dibujo",
    "n_i_globe": "Globo terráqueo",
    "n_i_harp": "Arpa",
    "n_i_musicstand": "Atril de música",
    "n_i_djdesk": "Mesa de DJ",
    "ic_learn": "Aulas y laboratorios",
    "ic_work": "Oficinas y trabajo",
    "n_i_labbench": "Mesa de laboratorio",
    "n_i_fumehood": "Campana extractora",
    "n_i_microscope": "Microscopio",
    "n_i_lectern": "Atril",
    "n_i_chalkboard": "Pizarra",
    "n_i_cubbies": "Casilleros",
    "n_i_skeleton": "Esqueleto",
    "n_i_laptopcart": "Carro de portátiles",
    "n_i_bleachers": "Gradas",
    "n_i_hoop": "Canasta",
    "n_i_kidstable": "Mesa infantil",
    "n_i_cubicle": "Cubículo",
    "n_i_conftable": "Mesa de juntas",
    "n_i_copier": "Fotocopiadora",
    "n_i_shredder": "Trituradora de papel",
    "n_i_watercooler": "Dispensador de agua",
    "n_i_safe": "Caja fuerte",
    "n_i_frontdesk": "Mostrador de recepción",
    "n_i_plotter": "Plóter",
    "n_i_mailsorter": "Clasificador de correo",
    "n_i_flipchart": "Rotafolio",
    "n_i_partition": "Mampara",
    "n_i_umbrellastand": "Paragüero",
    "n_i_futon": "Futón",
    "n_i_pouf": "Puf",
    "n_i_laddershelf": "Estantería escalera",
    "n_i_curio": "Vitrina",
    "n_i_grandclock": "Reloj de pie",
    "n_i_canopybed": "Cama con dosel",
    "n_i_murphybed": "Cama abatible",
    "n_i_bassinet": "Moisés",
    "n_i_changingtable": "Cambiador",
    "n_i_rockinghorse": "Caballito balancín",
    "n_i_dollhouse": "Casa de muñecas",
    "n_i_kidtent": "Tienda infantil",
    "n_i_knifeblock": "Taco de cuchillos",
    "n_i_blender": "Batidora de vaso",
    "n_i_mixer": "Batidora amasadora",
    "n_i_ricecooker": "Arrocera",
    "n_i_airfryer": "Freidora de aire",
    "n_i_breadbox": "Panera",
    "n_i_potrack": "Colgador de ollas",
    "n_i_trashsort": "Cubos de reciclaje",
    "n_i_spicerack": "Especiero",
    "n_i_toolwall": "Panel de herramientas",
    "n_i_bidet": "Bidé",
    "n_i_urinal": "Urinario",
    "n_i_handdryer": "Secamanos",
    "n_i_toiletstall": "Cabina de inodoro",
    "n_i_sauna": "Sauna",
    "n_i_scalebath": "Báscula de baño",
    "n_i_playset": "Fuerte de juegos",
    "n_i_playslide": "Tobogán",
    "n_i_seesaw": "Balancín",
    "n_i_sandbox": "Arenero",
    "n_i_picnic": "Mesa de picnic",
    "n_i_umbrella": "Sombrilla",
    "n_i_firehydrant": "Hidrante",
    "n_i_bollard": "Bolardo",
    "n_i_stopsign": "Señal de stop",
    "n_i_newsbox": "Expendedor de periódicos",
    "n_i_busstop": "Parada de autobús",
    "n_i_statue": "Estatua",
    "n_i_flagpole": "Mástil",
    "n_i_compost": "Compostador",
    "n_i_rainbarrel": "Barril de lluvia",
    "n_i_greenhouse": "Invernadero",
    "n_i_chickencoop": "Gallinero",
    "n_i_doghouse": "Caseta de perro",
    "n_i_hammock": "Hamaca",
    "n_i_tent": "Tienda de campaña",
    "n_i_wheelbarrow": "Carretilla",
    "n_i_lawnmower": "Cortacésped",
    "n_i_ladder": "Escalera de tijera",
    "n_i_generator": "Generador",
    "n_i_kayak": "Kayak",
    "n_i_motorcycle": "Motocicleta",
    "n_i_golfcart": "Carrito de golf",
    "vg_head": "Acera",
    "vg_none": "Junto al bordillo",
    "vg_strip": "Franja de césped",
    "vg_trees": "Árboles entre medias",
    "vg_land": "Franja de césped hasta el bordillo: {area}",
    "ln_head": "Carriles de la calle",
    "ln_two": "2 carriles",
    "ln_four": "4 carriles",
    "ln_six": "6 carriles",
    # the building site's last works outside (40-works-site.js)
    "jw_pave": "Asfaltando y pintando el aparcamiento",
    "jw_walks": "Hormigonando las aceras",
    "jw_plant": "Plantando y vallando",
    "jw_fix": "Colocando farolas, aparcabicis y contenedores",
    "jw_open": "Abierto: llegan los primeros coches",
    # the building site's calendar (40-works-day.js)
    "wv_bar": "Dónde va la obra: arrastra para retroceder o avanzar", "wv_play": "Reproducir (Espacio)", "wv_pause": "Pausa (Espacio)", "wv_again": "Ver de nuevo desde aquí", "wv_wait": "Preparando la obra", "wv_value": "{gone} de {all}",
    "jc_day": "Día {n} de unos {d}",
    "jc_done_head": "Terminado",
    "jc_work": "El equipo está trabajando",
    "jc_lunch": "Pausa para comer",
    "jc_home": "El equipo se va a casa",
    "jc_night": "Obra cerrada por la noche",
    "jc_weekend": "Fin de semana: obra cerrada",
    "jc_holiday": "Festivo: obra cerrada",
    "jc_late": "Esperando una entrega atrasada",
    "jc_broke": "Máquina averiada: esperando la reparación",
    "jc_short": "Hoy faltan manos",
    "jc_inspect": "Inspector en la obra: {what}",
    "jc_fail": "Inspección no superada: corrigiendo {what}",
    "jc_insp_footing": "cimientos",
    "jc_insp_frame": "estructura",
    "jc_insp_final": "inspección final",
    "jc_off_rain": "Sin trabajo por la lluvia",
    "jc_off_storm": "Tormenta: obra cerrada",
    "jc_off_snow": "Sin trabajo por la nieve",
    "jc_slow_drizzle": "Llovizna: el trabajo va más lento",
    "jc_slow_rain": "Lluvia: el trabajo exterior va más lento",
    "jc_slow_storm": "Tormenta: el trabajo exterior va más lento",
    "jc_slow_snow": "Nieve: se avanza despacio",
    "jc_slow_wind": "Viento fuerte: la grúa parada",
    "jc_done": "Construido en {days} días laborables ({weeks} semanas).",
    "jc_done_lost": "{n} días perdidos por el tiempo.",
    "jc_done_insp": "{n} inspecciones superadas.",
    "jc_done_insp_fail": "{n} inspecciones, {f} no superadas y corregidas.",
    "jc_wx_clear": "Despejado",
    "jc_wx_cloudy": "Nublado",
    "jc_wx_drizzle": "Llovizna",
    "jc_wx_rain": "Lluvia",
    "jc_wx_storm": "Tormenta",
    "jc_wx_snow": "Nieve",
    "jc_wx_wind": "Ventoso",
}

speaks("es", "Español", ES)
