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
    "tr_head": "Traducir código", "tr_go": "Traducir",
    "tr_pick": "El lenguaje al que se traduce tu código",
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
    "v3_open": "Vista 3D",
    "v3_tip": "Verlo en 3D",
    "v3_empty": "Todavía no hay nada que construir.",
    "v3_low": "Paredes bajas",
    "v3_hint": "Arrastra o usa las flechas para girar · W A S D para moverte · rueda para acercar",
    "v3_close": "Cerrar la vista 3D",
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
    "v3_hint_walk": "W A S D para andar · las flechas para mirar · E o un clic abre puertas",
    "v3_restart": "Volver a empezar",
    "v3_door": "Puerta",
    "v3_locked": "Está cerrada con llave.",
    "v3_no_door": "No hay ninguna puerta cerca.",
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
    "st_open": "Empezar una casa",
    "st_open_tip": "Crear una casa amueblada con unas pocas opciones: dormitorios, baños y otras habitaciones",
    "st_title": "Empezar una casa",
    "st_sub": "Elige las habitaciones. Se distribuyen y amueblan, unidas con flechas; en 3D se juntan, con una puerta entre cada una.",
    "st_beds": "Dormitorios",
    "st_baths": "Baños",
    "st_open_plan": "Cocina y comedor en una sola habitación",
    "st_office": "Un despacho",
    "st_laundry": "Un lavadero",
    "st_garage": "Un garaje",
    "st_closet": "Un vestidor",
    "st_spread": "Separadas en el papel",
    "st_make": "Crear la casa",
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
    "dz_finish": "Acabado",
    "dz_fin_main": "Principal",
    "dz_fin_trim": "Detalles",
    "dz_fin_plain_tip": "Volver a los colores de siempre",
    "sizes": "Medidas",
    "sizes_tip": "Escribir en el plano el largo, el ancho y la altura del techo de cada habitación, y el ancho, el fondo y la altura de cada mueble",
    "ic_fitness": "Ejercicio y juego",
    "ic_utility": "Garaje y servicio",
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
    "n_i_mailbox": "Buzón",
    "n_i_bikerack": "Aparcabicicletas",
    "n_i_workbench": "Banco de trabajo",
    "n_i_shelving": "Estantería",
    "n_i_toolchest": "Carro de herramientas",
    "n_i_furnace": "Caldera",
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
    "wk_i_mailbox": "mira el buzón",
    "wk_i_bikerack": "coge la bicicleta",
    "wk_i_workbench": "arregla algo en el banco de trabajo",
    "wk_i_shelving": "busca una caja en la estantería",
    "wk_i_toolchest": "coge una llave inglesa",
    "wk_i_furnace": "sube la calefacción",
}

speaks("es", "Español", ES)
