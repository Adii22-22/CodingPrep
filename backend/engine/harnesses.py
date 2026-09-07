"""
Builds the full source file (user code + generated harness) for each language.

The harness's job is always the same: read the test case's input_data as JSON
from stdin, call the user's function with those arguments, and print the
return value back out as JSON on stdout - so views.py can compare it against
the expected output the same way regardless of language.

Python needs almost no harness since it's dynamically typed.
Java and C need real type information (Problem.parameter_types / return_type)
because you can't call a typed function with untyped JSON values directly.
"""

import json


SUPPORTED_TYPES = {"int", "long", "double", "boolean", "string", "int[]", "long[]", "double[]", "string[]"}


def build_python_source(user_code: str, function_name: str, parameter_names: list) -> str:
    param_list = ", ".join(parameter_names)
    return f'''
import sys, json

{user_code}

_input = json.loads(sys.stdin.read())
_result = {function_name}(**_input)
print(json.dumps(_result))
'''


def build_java_source(user_code: str, function_name: str,
                       parameter_names: list, parameter_types: list,
                       return_type: str) -> str:
    """
    Expects user_code to define a public method matching:
        public static <return_type> <function_name>(<typed params>) { ... }
    inside a class named `Solution`.

    Generates a Main.java that reads the test case JSON from stdin, does a
    minimal manual parse (no external JSON library available offline in the
    sandbox image), calls Solution.<function_name>, and prints the JSON result.

    NOTE: this manual parser only supports the SUPPORTED_TYPES above. Extend
    it if you add problems needing e.g. nested objects or 2D arrays.
    """
    parse_lines = []
    call_args = []
    for name, ptype in zip(parameter_names, parameter_types):
        var = f"arg_{name}"
        call_args.append(var)
        if ptype == "int":
            parse_lines.append(f'int {var} = ((Number) input.get("{name}")).intValue();')
        elif ptype == "long":
            parse_lines.append(f'long {var} = ((Number) input.get("{name}")).longValue();')
        elif ptype == "double":
            parse_lines.append(f'double {var} = ((Number) input.get("{name}")).doubleValue();')
        elif ptype == "boolean":
            parse_lines.append(f'boolean {var} = (Boolean) input.get("{name}");')
        elif ptype == "string":
            parse_lines.append(f'String {var} = (String) input.get("{name}");')
        elif ptype == "int[]":
            parse_lines.append(
                f'int[] {var} = ((java.util.List<?>) input.get("{name}")).stream()'
                f'.mapToInt(x -> ((Number) x).intValue()).toArray();'
            )
        else:
            raise ValueError(f"Unsupported Java parameter type: {ptype}")

    if return_type in ("int", "long", "boolean"):
        print_call = f'System.out.println(result);'
    elif return_type == "double":
        print_call = f'System.out.println(result);'
    elif return_type == "string":
        print_call = f'System.out.println("\\"" + result.replace("\\"", "\\\\\\"") + "\\"");'
    elif return_type == "int[]":
        print_call = (
            'StringBuilder sb = new StringBuilder("[");'
            'for (int i = 0; i < result.length; i++) { if (i > 0) sb.append(","); sb.append(result[i]); }'
            'sb.append("]"); System.out.println(sb.toString());'
        )
    else:
        raise ValueError(f"Unsupported Java return type: {return_type}")

    return f'''
import java.util.*;
import java.io.*;

{user_code}

public class Main {{
    // Extremely small JSON object parser - only handles a single flat
    // object of numbers/strings/bools/arrays, which is all test cases need.
    static Map<String, Object> parseFlatJson(String json) {{
        Map<String, Object> map = new LinkedHashMap<>();
        json = json.trim();
        json = json.substring(1, json.length() - 1); // strip {{ }}
        int depth = 0, start = 0;
        List<String> parts = new ArrayList<>();
        for (int i = 0; i < json.length(); i++) {{
            char c = json.charAt(i);
            if (c == '[' || c == '{{') depth++;
            if (c == ']' || c == '}}') depth--;
            if (c == ',' && depth == 0) {{ parts.add(json.substring(start, i)); start = i + 1; }}
        }}
        parts.add(json.substring(start));
        for (String part : parts) {{
            int colon = part.indexOf(':');
            String key = part.substring(0, colon).trim().replaceAll("^\\"|\\"$", "");
            String val = part.substring(colon + 1).trim();
            Object parsed;
            if (val.startsWith("[")) {{
                String inner = val.substring(1, val.length() - 1);
                List<Object> list = new ArrayList<>();
                if (!inner.trim().isEmpty()) {{
                    for (String v : inner.split(",")) list.add(Double.parseDouble(v.trim()));
                }}
                parsed = list;
            }} else if (val.startsWith("\\"")) {{
                parsed = val.substring(1, val.length() - 1);
            }} else if (val.equals("true") || val.equals("false")) {{
                parsed = Boolean.parseBoolean(val);
            }} else {{
                parsed = Double.parseDouble(val);
            }}
            map.put(key, parsed);
        }}
        return map;
    }}

    public static void main(String[] args) throws Exception {{
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder raw = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) raw.append(line);
        Map<String, Object> input = parseFlatJson(raw.toString());

        {chr(10).join(parse_lines)}

        {return_type if return_type != "int[]" else "int[]"} result = Solution.{function_name}({", ".join(call_args)});
        {print_call}
    }}
}}
'''


def build_c_source(user_code: str, function_name: str,
                    parameter_names: list, parameter_types: list,
                    return_type: str) -> str:
    """
    C has no JSON parsing in its standard library, and no reflection, so
    a fully generic harness isn't practical. Instead: test case input for C
    problems is passed as space-separated values on a single stdin line, in
    the exact order of parameter_names, rather than as JSON. views.py must
    format stdin_data accordingly when language == "c" (see NOTE in views.py
    integration section of the README).

    Only scalar int/double/long params are supported for C to keep this
    tractable - array params would need a length-prefixed format instead.
    """
    scanf_specs = {"int": "%d", "long": "%ld", "double": "%lf"}
    if any(t not in scanf_specs for t in parameter_types) or return_type not in scanf_specs:
        raise ValueError("C harness currently only supports scalar int/long/double params and return type")

    decls = []
    scanf_fmt = " ".join(scanf_specs[t] for t in parameter_types)
    scanf_args = ", ".join(f"&{name}" for name in parameter_names)
    for name, ptype in zip(parameter_names, parameter_types):
        c_type = {"int": "int", "long": "long", "double": "double"}[ptype]
        decls.append(f"{c_type} {name};")

    print_fmt = {"int": '"%d\\n"', "long": '"%ld\\n"', "double": '"%f\\n"'}[return_type]

    return f'''
#include <stdio.h>

{user_code}

int main() {{
    {chr(10).join("    " + d for d in decls)}
    scanf("{scanf_fmt}", {scanf_args});
    printf({print_fmt}, {function_name}({", ".join(parameter_names)}));
    return 0;
}}
'''
