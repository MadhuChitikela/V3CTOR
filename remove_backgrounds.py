import os

css_path = os.path.join(os.path.dirname(__file__), "style.css")

if os.path.exists(css_path):
    with open(css_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 1. Services section background rules target
    services_target = """.services-section {
    min-height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 120px 20px;
    background-color: transparent;
    z-index: 10;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cdefs%3E%3Cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='rgba(10, 37, 64, 0.012)' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3Cpath d='M0 100 H200 M100 0 V200' stroke='rgba(0, 86, 255, 0.025)' stroke-width='0.8' fill='none'/%3E%3Ccircle cx='100' cy='100' r='3' fill='rgba(0, 86, 255, 0.04)'/%3E%3Cpath d='M20 20 L25 20 M20 20 L20 25 M180 20 L175 20 M180 20 L180 25 M20 180 L25 180 M20 180 L20 175 M180 180 L175 180 M180 180 L180 175' stroke='rgba(198, 124, 78, 0.03)' stroke-width='1' fill='none'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-position: center;
    background-attachment: fixed;
}"""
    services_replacement = """.services-section {
    min-height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 120px 20px;
    background-color: transparent;
    z-index: 10;
}"""

    # 2. Process section background rules target
    process_target = """.process-section {
    min-height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 120px 20px;
    background-color: transparent;
    z-index: 10;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250' viewBox='0 0 250 250'%3E%3Cpath d='M-10 50 H260 M-10 125 H260 M-10 200 H260' stroke='rgba(10, 37, 64, 0.008)' stroke-width='0.5' fill='none'/%3E%3Cpath d='M30 50 L60 85 L120 85 L150 125 L190 125 L210 200' stroke='rgba(0, 86, 255, 0.02)' stroke-width='0.8' fill='none'/%3E%3Cpath d='M100 50 L120 125 L90 200' stroke='rgba(198, 124, 78, 0.02)' stroke-width='0.8' fill='none'/%3E%3Ccircle cx='30' cy='50' r='2.5' fill='rgba(0, 86, 255, 0.04)'/%3E%3Ccircle cx='120' cy='85' r='2.5' fill='rgba(0, 86, 255, 0.04)'/%3E%3Ccircle cx='150' cy='125' r='2.5' fill='rgba(0, 86, 255, 0.04)'/%3E%3Ccircle cx='210' cy='200' r='2.5' fill='rgba(0, 86, 255, 0.04)'/%3E%3Ccircle cx='100' cy='50' r='2.5' fill='rgba(198, 124, 78, 0.04)'/%3E%3Ccircle cx='120' cy='125' r='2.5' fill='rgba(198, 124, 78, 0.04)'/%3E%3Ccircle cx='90' cy='200' r='2.5' fill='rgba(198, 124, 78, 0.04)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-position: center;
    background-attachment: fixed;
}"""
    process_replacement = """.process-section {
    min-height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 120px 20px;
    background-color: transparent;
    z-index: 10;
}"""

    # 3. Innovations section background rules target
    innovations_target = """.innovations-section {
    min-height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 120px 20px;
    background-color: transparent;
    z-index: 10;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Cpath d='M30 50 L100 80 L150 40 L220 90 L270 50 M100 80 L80 160 L160 180 L150 40 M160 180 L220 90 M80 160 L50 240 L130 260 L160 180 M130 260 L200 230 L220 90 M200 230 L250 240 L270 50 M250 240 L280 160 L220 90' stroke='rgba(198, 124, 78, 0.025)' stroke-width='0.8' fill='none'/%3E%3Ccircle cx='30' cy='50' r='2' fill='rgba(198, 124, 78, 0.04)'/%3E%3Ccircle cx='100' cy='80' r='3' fill='rgba(198, 124, 78, 0.05)'/%3E%3Ccircle cx='150' cy='40' r='2.5' fill='rgba(198, 124, 78, 0.04)'/%3E%3Ccircle cx='220' cy='90' r='3' fill='rgba(198, 124, 78, 0.05)'/%3E%3Ccircle cx='270' cy='50' r='2' fill='rgba(198, 124, 78, 0.04)'/%3E%3Ccircle cx='80' cy='160' r='2.5' fill='rgba(198, 124, 78, 0.04)'/%3E%3Ccircle cx='160' cy='180' r='3' fill='rgba(198, 124, 78, 0.05)'/%3E%3Ccircle cx='50' cy='240' r='2' fill='rgba(198, 124, 78, 0.04)'/%3E%3Ccircle cx='130' cy='260' r='3' fill='rgba(198, 124, 78, 0.05)'/%3E%3Ccircle cx='200' cy='230' r='2.5' fill='rgba(198, 124, 78, 0.04)'/%3E%3Ccircle cx='250' cy='240' r='2' fill='rgba(198, 124, 78, 0.04)'/%3E%3Ccircle cx='280' cy='160' r='2.5' fill='rgba(198, 124, 78, 0.04)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-position: center;
    background-attachment: fixed;
}"""
    innovations_replacement = """.innovations-section {
    min-height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 120px 20px;
    background-color: transparent;
    z-index: 10;
}"""

    # 4. Mobile background overrides target
    mobile_target = """    /* Mobile/tablet background attachment override */
    .services-section, 
    .innovations-section, 
    .process-section {
        background-attachment: scroll !important;
    }"""

    new_content = content
    if services_target in new_content:
        new_content = new_content.replace(services_target, services_replacement)
    if process_target in new_content:
        new_content = new_content.replace(process_target, process_replacement)
    if innovations_target in new_content:
        new_content = new_content.replace(innovations_target, innovations_replacement)
    if mobile_target in new_content:
        new_content = new_content.replace(mobile_target, "")
        
    with open(css_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("SUCCESS: Background patterns removed from style.css!")
else:
    print("ERROR: style.css not found.")
