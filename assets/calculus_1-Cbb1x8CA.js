var e=`calculus_1`,t=1,n=[{id:`c1_01`,difficulty:`easy`,question:{en:`Find the derivative:
d/dx [x³]`,es:`Encuentra la derivada:
d/dx [x³]`,pl:`Oblicz pochodną:
d/dx [x³]`,is:`Finndu afleiðuna:
d/dx [x³]`,zh:`求导：
d/dx [x³]`},answer:`3x^2|3x2`,hint:{en:`Use the power rule: d/dx [xⁿ] = n·xⁿ⁻¹`,es:`Usa la regla de la potencia: d/dx [xⁿ] = n·xⁿ⁻¹`,pl:`Użyj reguły potęgi: d/dx [xⁿ] = n·xⁿ⁻¹`,is:`Notaðu veldareglan: d/dx [xⁿ] = n·xⁿ⁻¹`,zh:`使用幂法则：d/dx [xⁿ] = n·xⁿ⁻¹`},solution:{en:`d/dx [x³] = 3x²`,es:`d/dx [x³] = 3x²`,pl:`d/dx [x³] = 3x²`,is:`d/dx [x³] = 3x²`,zh:`d/dx [x³] = 3x²`}},{id:`c1_02`,difficulty:`easy`,question:{en:`Find the derivative:
d/dx [sin(x)]`,es:`Encuentra la derivada:
d/dx [sin(x)]`,pl:`Oblicz pochodną:
d/dx [sin(x)]`,is:`Finndu afleiðuna:
d/dx [sin(x)]`,zh:`求导：
d/dx [sin(x)]`},answer:`cos(x)|cosx`,hint:{en:`This is a standard derivative you should memorize.`,es:`Esta es una derivada estándar que deberías memorizar.`,pl:`To standardowa pochodna, którą warto zapamiętać.`,is:`Þetta er staðlað afleiða sem þú ættir að leggja á minnið.`,zh:`这是一个需要记忆的标准导数。`},solution:{en:`d/dx [sin(x)] = cos(x)`,es:`d/dx [sin(x)] = cos(x)`,pl:`d/dx [sin(x)] = cos(x)`,is:`d/dx [sin(x)] = cos(x)`,zh:`d/dx [sin(x)] = cos(x)`}},{id:`c1_03`,difficulty:`easy`,question:{en:`Evaluate the limit:
lim(x→0) sin(x)/x`,es:`Evalúa el límite:
lim(x→0) sin(x)/x`,pl:`Oblicz granicę:
lim(x→0) sin(x)/x`,is:`Reiknaðu markgildi:
lim(x→0) sin(x)/x`,zh:`求极限：
lim(x→0) sin(x)/x`},answer:`1`,hint:{en:`This is a fundamental limit in calculus. You may use L'Hôpital's rule or the known result.`,es:`Este es un límite fundamental en cálculo.`,pl:`To fundamentalna granica w rachunku różniczkowym.`,is:`Þetta er grundvallarmörk í diffurreikningi.`,zh:`这是微积分中的基本极限。`},solution:{en:`By the squeeze theorem (or L'Hôpital): lim(x→0) sin(x)/x = 1`,es:`Por el teorema del emparedado (o L'Hôpital): lím(x→0) sin(x)/x = 1`,pl:`Przez twierdzenie o trzech ciągach: lim(x→0) sin(x)/x = 1`,is:`Með þrýstingssetningu: lim(x→0) sin(x)/x = 1`,zh:`由夹逼定理（或洛必达法则）：lim(x→0) sin(x)/x = 1`}},{id:`c1_04`,difficulty:`easy`,question:{en:`Find the antiderivative:
∫ 2x dx`,es:`Encuentra la antiderivada:
∫ 2x dx`,pl:`Oblicz całkę nieoznaczoną:
∫ 2x dx`,is:`Finndu stofnfall:
∫ 2x dx`,zh:`求不定积分：
∫ 2x dx`},answer:`x^2+C|x2+C`,hint:{en:`Use ∫ xⁿ dx = xⁿ⁺¹/(n+1) + C. Don't forget the constant C.`,es:`Usa ∫ xⁿ dx = xⁿ⁺¹/(n+1) + C. No olvides la constante C.`,pl:`Użyj ∫ xⁿ dx = xⁿ⁺¹/(n+1) + C. Nie zapomnij o stałej C.`,is:`Notaðu ∫ xⁿ dx = xⁿ⁺¹/(n+1) + C. Gleymdu ekki C.`,zh:`使用 ∫ xⁿ dx = xⁿ⁺¹/(n+1) + C，不要忘记常数 C。`},solution:{en:`∫ 2x dx = 2·(x²/2) + C = x² + C`,es:`∫ 2x dx = x² + C`,pl:`∫ 2x dx = x² + C`,is:`∫ 2x dx = x² + C`,zh:`∫ 2x dx = x² + C`}},{id:`c1_05`,difficulty:`easy`,question:{en:`Find the derivative:
d/dx [eˣ]`,es:`Encuentra la derivada:
d/dx [eˣ]`,pl:`Oblicz pochodną:
d/dx [eˣ]`,is:`Finndu afleiðuna:
d/dx [eˣ]`,zh:`求导：
d/dx [eˣ]`},answer:`e^x|ex`,hint:{en:`The exponential function is its own derivative.`,es:`La función exponencial es su propia derivada.`,pl:`Funkcja wykładnicza jest swoją własną pochodną.`,is:`Veldisvísisfallið er eigin afleiða sín.`,zh:`指数函数是它自身的导数。`},solution:{en:`d/dx [eˣ] = eˣ`,es:`d/dx [eˣ] = eˣ`,pl:`d/dx [eˣ] = eˣ`,is:`d/dx [eˣ] = eˣ`,zh:`d/dx [eˣ] = eˣ`}},{id:`c1_06`,difficulty:`medium`,question:{en:`Find the derivative using the product rule:
d/dx [x² · sin(x)]`,es:`Encuentra la derivada usando la regla del producto:
d/dx [x² · sin(x)]`,pl:`Oblicz pochodną korzystając z reguły iloczynu:
d/dx [x² · sin(x)]`,is:`Finndu afleiðuna með margfeldisreglunni:
d/dx [x² · sin(x)]`,zh:`用乘积法则求导：
d/dx [x² · sin(x)]`},answer:`2x*sin(x)+x^2*cos(x)|2xsin(x)+x2cos(x)`,hint:{en:`Product rule: d/dx[u·v] = u'v + uv'. Here u = x², v = sin(x).`,es:`Regla del producto: d/dx[u·v] = u'v + uv'.`,pl:`Reguła iloczynu: d/dx[u·v] = u'v + uv'.`,is:`Margfeldisreglan: d/dx[u·v] = u'v + uv'.`,zh:`乘积法则：d/dx[u·v] = u'v + uv'。`},solution:{en:`u = x², u' = 2x; v = sin(x), v' = cos(x). Result: 2x·sin(x) + x²·cos(x)`,es:`u' = 2x, v' = cos(x). Resultado: 2x·sin(x) + x²·cos(x)`,pl:`u' = 2x, v' = cos(x). Wynik: 2x·sin(x) + x²·cos(x)`,is:`u' = 2x, v' = cos(x). Niðurstaða: 2x·sin(x) + x²·cos(x)`,zh:`u' = 2x，v' = cos(x)。结果：2x·sin(x) + x²·cos(x)`}},{id:`c1_07`,difficulty:`medium`,question:{en:`Find the derivative using the chain rule:
d/dx [sin(x²)]`,es:`Encuentra la derivada usando la regla de la cadena:
d/dx [sin(x²)]`,pl:`Oblicz pochodną korzystając z reguły łańcuchowej:
d/dx [sin(x²)]`,is:`Finndu afleiðuna með keðjureglunni:
d/dx [sin(x²)]`,zh:`用链式法则求导：
d/dx [sin(x²)]`},answer:`2x*cos(x^2)|2xcos(x2)`,hint:{en:`Chain rule: d/dx[f(g(x))] = f'(g(x))·g'(x). The outer function is sin, inner is x².`,es:`Regla de la cadena: d/dx[f(g(x))] = f'(g(x))·g'(x).`,pl:`Reguła łańcuchowa: d/dx[f(g(x))] = f'(g(x))·g'(x).`,is:`Keðjureglan: d/dx[f(g(x))] = f'(g(x))·g'(x).`,zh:`链式法则：d/dx[f(g(x))] = f'(g(x))·g'(x)。`},solution:{en:`Outer: sin → cos; inner: x² → 2x. Result: cos(x²) · 2x = 2x·cos(x²)`,es:`Resultado: 2x·cos(x²)`,pl:`Wynik: 2x·cos(x²)`,is:`Niðurstaða: 2x·cos(x²)`,zh:`结果：2x·cos(x²)`}},{id:`c1_08`,difficulty:`medium`,question:{en:`Evaluate the definite integral:
∫₀¹ x² dx`,es:`Evalúa la integral definida:
∫₀¹ x² dx`,pl:`Oblicz całkę oznaczoną:
∫₀¹ x² dx`,is:`Reiknaðu ákveðið heildi:
∫₀¹ x² dx`,zh:`求定积分：
∫₀¹ x² dx`},answer:`1/3|0.333|0.3333`,hint:{en:`Find the antiderivative x³/3, then evaluate at x=1 minus x=0.`,es:`Encuentra la antiderivada x³/3, luego evalúa en x=1 menos x=0.`,pl:`Oblicz stofnfall x³/3, potem oblicz w x=1 minus x=0.`,is:`Stofnfall er x³/3, reiknaðu svo við x=1 mínus x=0.`,zh:`不定积分为 x³/3，然后代入上下限相减。`},solution:{en:`∫₀¹ x² dx = [x³/3]₀¹ = 1/3 − 0 = 1/3`,es:`[x³/3]₀¹ = 1/3`,pl:`[x³/3]₀¹ = 1/3`,is:`[x³/3]₀¹ = 1/3`,zh:`[x³/3]₀¹ = 1/3 − 0 = 1/3`}},{id:`c1_09`,difficulty:`medium`,question:{en:`Evaluate the limit:
lim(x→∞) (x² + 1) / (2x² − 3)`,es:`Evalúa el límite:
lim(x→∞) (x² + 1) / (2x² − 3)`,pl:`Oblicz granicę:
lim(x→∞) (x² + 1) / (2x² − 3)`,is:`Reiknaðu markgildi:
lim(x→∞) (x² + 1) / (2x² − 3)`,zh:`求极限：
lim(x→∞) (x² + 1) / (2x² − 3)`},answer:`1/2|0.5`,hint:{en:`Divide numerator and denominator by x² and let x→∞.`,es:`Divide numerador y denominador entre x² y deja que x→∞.`,pl:`Podziel licznik i mianownik przez x² i pozwól x→∞.`,is:`Deildu teljara og nefnara með x² og láttu x→∞.`,zh:`分子分母同除以 x²，然后令 x→∞。`},solution:{en:`Divide by x²: (1 + 1/x²) / (2 − 3/x²) → (1+0)/(2−0) = 1/2`,es:`Dividir por x²: 1/(2) = 1/2`,pl:`Po podzieleniu przez x²: 1/2`,is:`Eftir deiling með x²: 1/2`,zh:`除以 x² 后：(1+0)/(2−0) = 1/2`}},{id:`c1_10`,difficulty:`medium`,question:{en:`Find the critical points of:
f(x) = x³ − 3x

List all x-values separated by commas.`,es:`Encuentra los puntos críticos de:
f(x) = x³ − 3x

Escribe todos los valores x separados por coma.`,pl:`Znajdź punkty krytyczne:
f(x) = x³ − 3x

Podaj wszystkie wartości x oddzielone przecinkami.`,is:`Finndu gagnrýnar punktar:
f(x) = x³ − 3x

Skrifaðu allar x-gildi aðskilin með kommu.`,zh:`求函数的临界点：
f(x) = x³ − 3x

用逗号分隔所有 x 值。`},answer:`1,-1|-1,1`,hint:{en:`Set f'(x) = 0 and solve. f'(x) = 3x² − 3.`,es:`Iguala f'(x) = 0 y resuelve. f'(x) = 3x² − 3.`,pl:`Ustaw f'(x) = 0 i rozwiąż. f'(x) = 3x² − 3.`,is:`Settu f'(x) = 0 og leysdu. f'(x) = 3x² − 3.`,zh:`令 f'(x) = 0 并求解。f'(x) = 3x² − 3。`},solution:{en:`f'(x) = 3x² − 3 = 0 → x² = 1 → x = ±1. Critical points: x = 1 and x = −1`,es:`3x² − 3 = 0 → x = ±1`,pl:`3x² − 3 = 0 → x = ±1`,is:`3x² − 3 = 0 → x = ±1`,zh:`3x² − 3 = 0 → x = ±1`}},{id:`c1_11`,difficulty:`medium`,question:{en:`Find the equation of the tangent line to y = x² at x = 2.`,es:`Encuentra la ecuación de la tangente a y = x² en x = 2.`,pl:`Znajdź równanie stycznej do y = x² w punkcie x = 2.`,is:`Finndu jöfnu snertilínunnar við y = x² við x = 2.`,zh:`求曲线 y = x² 在 x = 2 处的切线方程。`},answer:`y=4x-4`,hint:{en:`Find the slope m = f'(2), and the point (2, f(2)). Then use y − y₀ = m(x − x₀).`,es:`Halla m = f'(2) y el punto (2, f(2)). Usa y − y₀ = m(x − x₀).`,pl:`Oblicz m = f'(2) i punkt (2, f(2)). Użyj y − y₀ = m(x − x₀).`,is:`Reiknaðu m = f'(2) og punktinn (2, f(2)). Notaðu y − y₀ = m(x − x₀).`,zh:`斜率 m = f'(2)，点 (2, f(2))，用点斜式。`},solution:{en:`f'(x) = 2x → f'(2) = 4. Point: (2, 4). Tangent: y − 4 = 4(x − 2) → y = 4x − 4`,es:`m = 4, punto (2,4): y = 4x − 4`,pl:`m = 4, punkt (2,4): y = 4x − 4`,is:`m = 4, punktur (2,4): y = 4x − 4`,zh:`m = 4，点 (2,4)：y = 4x − 4`}},{id:`c1_12`,difficulty:`medium`,question:{en:`Find the derivative:
d/dx [ln(x)]`,es:`Encuentra la derivada:
d/dx [ln(x)]`,pl:`Oblicz pochodną:
d/dx [ln(x)]`,is:`Finndu afleiðuna:
d/dx [ln(x)]`,zh:`求导：
d/dx [ln(x)]`},answer:`1/x`,hint:{en:`This is a standard result. The derivative of the natural log is 1/x.`,es:`La derivada del logaritmo natural es 1/x.`,pl:`Pochodna logarytmu naturalnego to 1/x.`,is:`Afleiða náttúrulega lógaritmans er 1/x.`,zh:`自然对数的导数为 1/x。`},solution:{en:`d/dx [ln(x)] = 1/x (for x > 0)`,es:`d/dx [ln(x)] = 1/x`,pl:`d/dx [ln(x)] = 1/x`,is:`d/dx [ln(x)] = 1/x`,zh:`d/dx [ln(x)] = 1/x`}},{id:`c1_13`,difficulty:`medium`,question:{en:`Find the derivative:
d/dx [tan(x)]`,es:`Encuentra la derivada:
d/dx [tan(x)]`,pl:`Oblicz pochodną:
d/dx [tan(x)]`,is:`Finndu afleiðuna:
d/dx [tan(x)]`,zh:`求导：
d/dx [tan(x)]`},answer:`sec^2(x)|sec2(x)|1/cos^2(x)`,hint:{en:`tan(x) = sin(x)/cos(x). Use the quotient rule, or recall the standard result.`,es:`tan(x) = sin(x)/cos(x). Usa la regla del cociente.`,pl:`tan(x) = sin(x)/cos(x). Użyj reguły ilorazu.`,is:`tan(x) = sin(x)/cos(x). Notaðu hlutfallsregluna.`,zh:`tan(x) = sin(x)/cos(x)，使用商法则。`},solution:{en:`d/dx [tan(x)] = sec²(x) = 1/cos²(x)`,es:`d/dx [tan(x)] = sec²(x)`,pl:`d/dx [tan(x)] = sec²(x)`,is:`d/dx [tan(x)] = sec²(x)`,zh:`d/dx [tan(x)] = sec²(x)`}},{id:`c1_14`,difficulty:`medium`,question:{en:`Find the derivative:
d/dx [arctan(x)]`,es:`Encuentra la derivada:
d/dx [arctan(x)]`,pl:`Oblicz pochodną:
d/dx [arctan(x)]`,is:`Finndu afleiðuna:
d/dx [arctan(x)]`,zh:`求导：
d/dx [arctan(x)]`},answer:`1/(1+x^2)|1/(x^2+1)`,hint:{en:`This is a standard inverse trig derivative.`,es:`Esta es una derivada trigonométrica inversa estándar.`,pl:`To standardowa pochodna odwrotnej funkcji trygonometrycznej.`,is:`Þetta er staðlað afleiða andhverfrar þríhyrningsfallsins.`,zh:`这是反三角函数的标准导数。`},solution:{en:`d/dx [arctan(x)] = 1/(1+x²)`,es:`d/dx [arctan(x)] = 1/(1+x²)`,pl:`d/dx [arctan(x)] = 1/(1+x²)`,is:`d/dx [arctan(x)] = 1/(1+x²)`,zh:`d/dx [arctan(x)] = 1/(1+x²)`}},{id:`c1_15`,difficulty:`hard`,question:{en:`Evaluate:
∫₀^π sin(x) dx`,es:`Evalúa:
∫₀^π sin(x) dx`,pl:`Oblicz:
∫₀^π sin(x) dx`,is:`Reiknaðu:
∫₀^π sin(x) dx`,zh:`求定积分：
∫₀^π sin(x) dx`},answer:`2`,hint:{en:`The antiderivative of sin(x) is −cos(x). Evaluate at π and 0.`,es:`La antiderivada de sin(x) es −cos(x). Evalúa en π y 0.`,pl:`Stofnfall sin(x) to −cos(x). Oblicz w π i 0.`,is:`Stofnfall sin(x) er −cos(x). Reiknaðu við π og 0.`,zh:`sin(x) 的不定积分为 −cos(x)，代入上下限。`},solution:{en:`[−cos(x)]₀^π = −cos(π) − (−cos(0)) = −(−1) − (−1) = 1 + 1 = 2`,es:`−cos(π) + cos(0) = 1 + 1 = 2`,pl:`−cos(π) + cos(0) = 1 + 1 = 2`,is:`−cos(π) + cos(0) = 1 + 1 = 2`,zh:`−cos(π) + cos(0) = 1 + 1 = 2`}},{id:`c1_16`,difficulty:`hard`,question:{en:`Find the area of the region between y = x² and y = x
(where they intersect between x = 0 and x = 1).`,es:`Encuentra el área de la región entre y = x² e y = x
(donde se intersecan entre x = 0 y x = 1).`,pl:`Znajdź pole między y = x² i y = x
(gdzie przecinają się między x = 0 a x = 1).`,is:`Finndu flatarmál svæðisins milli y = x² og y = x
(þar sem þær skerast milli x = 0 og x = 1).`,zh:`求 y = x² 和 y = x 之间的面积
（在 x = 0 和 x = 1 之间）。`},answer:`1/6|0.1667|0.167`,hint:{en:`Area = ∫₀¹ (x − x²) dx. Note x > x² on [0,1].`,es:`Área = ∫₀¹ (x − x²) dx.`,pl:`Pole = ∫₀¹ (x − x²) dx.`,is:`Flatarmál = ∫₀¹ (x − x²) dx.`,zh:`面积 = ∫₀¹ (x − x²) dx。`},solution:{en:`∫₀¹ (x − x²) dx = [x²/2 − x³/3]₀¹ = 1/2 − 1/3 = 1/6`,es:`[x²/2 − x³/3]₀¹ = 1/2 − 1/3 = 1/6`,pl:`[x²/2 − x³/3]₀¹ = 1/6`,is:`[x²/2 − x³/3]₀¹ = 1/6`,zh:`[x²/2 − x³/3]₀¹ = 1/2 − 1/3 = 1/6`}},{id:`c1_17`,difficulty:`hard`,question:{en:`Evaluate the limit using L'Hôpital's rule:
lim(x→0) (eˣ − 1 − x) / x²`,es:`Evalúa el límite usando la regla de L'Hôpital:
lim(x→0) (eˣ − 1 − x) / x²`,pl:`Oblicz granicę korzystając z reguły L'Hôpitala:
lim(x→0) (eˣ − 1 − x) / x²`,is:`Reiknaðu markgildi með reglu L'Hôpital:
lim(x→0) (eˣ − 1 − x) / x²`,zh:`用洛必达法则求极限：
lim(x→0) (eˣ − 1 − x) / x²`},answer:`1/2|0.5`,hint:{en:`This is 0/0 form. Apply L'Hôpital twice: differentiate numerator and denominator each time.`,es:`Forma 0/0. Aplica L'Hôpital dos veces.`,pl:`Forma 0/0. Zastosuj L'Hôpital dwukrotnie.`,is:`0/0 form. Notaðu L'Hôpital tvisvar.`,zh:`0/0 型。连续使用两次洛必达法则。`},solution:{en:`Step 1: (eˣ − 1)/(2x) — still 0/0. Step 2: eˣ/2 → e⁰/2 = 1/2`,es:`Paso 1: (eˣ−1)/(2x). Paso 2: eˣ/2 → 1/2`,pl:`Krok 1: (eˣ−1)/(2x). Krok 2: eˣ/2 → 1/2`,is:`Skref 1: (eˣ−1)/(2x). Skref 2: eˣ/2 → 1/2`,zh:`第1次：(eˣ−1)/(2x)。第2次：eˣ/2 → 1/2`}},{id:`c1_18`,difficulty:`hard`,question:{en:`Find the derivative using the quotient rule:
d/dx [(x² + 1) / (x − 1)]`,es:`Encuentra la derivada usando la regla del cociente:
d/dx [(x² + 1) / (x − 1)]`,pl:`Oblicz pochodną korzystając z reguły ilorazu:
d/dx [(x² + 1) / (x − 1)]`,is:`Finndu afleiðuna með hlutfallsreglunni:
d/dx [(x² + 1) / (x − 1)]`,zh:`用商法则求导：
d/dx [(x² + 1) / (x − 1)]`},answer:`(x^2-2x-1)/(x-1)^2`,hint:{en:`Quotient rule: (u/v)' = (u'v − uv') / v². Here u = x²+1, v = x−1.`,es:`Regla del cociente: (u/v)' = (u'v − uv') / v².`,pl:`Reguła ilorazu: (u/v)' = (u'v − uv') / v².`,is:`Hlutfallsreglan: (u/v)' = (u'v − uv') / v².`,zh:`商法则：(u/v)' = (u'v − uv') / v²。`},solution:{en:`u' = 2x, v' = 1. (2x(x−1) − (x²+1)·1) / (x−1)² = (2x²−2x−x²−1)/(x−1)² = (x²−2x−1)/(x−1)²`,es:`= (x²−2x−1)/(x−1)²`,pl:`= (x²−2x−1)/(x−1)²`,is:`= (x²−2x−1)/(x−1)²`,zh:`= (x²−2x−1)/(x−1)²`}},{id:`c1_19`,difficulty:`hard`,question:{en:`Find ∫ x·eˣ dx using integration by parts.`,es:`Encuentra ∫ x·eˣ dx usando integración por partes.`,pl:`Oblicz ∫ x·eˣ dx używając całkowania przez części.`,is:`Finndu ∫ x·eˣ dx með heildunarhlutum.`,zh:`用分部积分法求 ∫ x·eˣ dx。`},answer:`xe^x-e^x+C|(x-1)e^x+C|xex-ex+C`,hint:{en:`Let u = x and dv = eˣ dx. Then du = dx and v = eˣ. Apply ∫ u dv = uv − ∫ v du.`,es:`Sea u = x y dv = eˣ dx. Aplica ∫ u dv = uv − ∫ v du.`,pl:`Niech u = x i dv = eˣ dx. Zastosuj ∫ u dv = uv − ∫ v du.`,is:`Láttu u = x og dv = eˣ dx. Notaðu ∫ u dv = uv − ∫ v du.`,zh:`令 u = x，dv = eˣ dx。使用 ∫ u dv = uv − ∫ v du。`},solution:{en:`u=x, v=eˣ: x·eˣ − ∫ eˣ dx = x·eˣ − eˣ + C = (x−1)eˣ + C`,es:`x·eˣ − eˣ + C = (x−1)eˣ + C`,pl:`x·eˣ − eˣ + C = (x−1)eˣ + C`,is:`x·eˣ − eˣ + C = (x−1)eˣ + C`,zh:`x·eˣ − eˣ + C = (x−1)eˣ + C`}},{id:`c1_20`,difficulty:`hard`,question:{en:`Find the derivative of xˣ (with respect to x).`,es:`Encuentra la derivada de xˣ (con respecto a x).`,pl:`Oblicz pochodną xˣ (względem x).`,is:`Finndu afleiðu xˣ (með tilliti til x).`,zh:`求 xˣ 的导数（对 x）。`},answer:`x^x*(1+ln(x))|x^x(1+lnx)`,hint:{en:`Take the natural log of both sides: ln(y) = x·ln(x). Differentiate implicitly.`,es:`Toma el logaritmo natural de ambos lados: ln(y) = x·ln(x). Diferencia implícitamente.`,pl:`Logarytmuj obie strony: ln(y) = x·ln(x). Różniczkuj niejawnie.`,is:`Taktu náttúrulega lógaritma beggja hliða: ln(y) = x·ln(x). Diffurreiknaðu óbeint.`,zh:`两边取自然对数：ln(y) = x·ln(x)，再隐式求导。`},solution:{en:`ln(y) = x·ln(x). Differentiate: y'/y = ln(x) + 1. So y' = xˣ·(1 + ln x)`,es:`y'/y = ln(x) + 1 → y' = xˣ·(1 + ln x)`,pl:`y'/y = ln(x) + 1 → y' = xˣ·(1 + ln x)`,is:`y'/y = ln(x) + 1 → y' = xˣ·(1 + ln x)`,zh:`y'/y = ln(x) + 1 → y' = xˣ·(1 + ln x)`}}],r={id:e,version:1,puzzles:n};export{r as default,e as id,n as puzzles,t as version};