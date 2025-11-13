import requests
from bs4 import BeautifulSoup
#trying to get course data from auc websites
TERM = "202510"   # <- change to your term
SUBJECTS = ["CSCE", "MACT"]

BASE_URL = "https://ssb-prod.ec.aucegypt.edu/PROD/bwckschd.p_get_crse_unsec"

def parse_course_table(html):
    soup = BeautifulSoup(html, "html.parser")
    results = []

    tables = soup.find_all("table", class_="datadisplaytable")

    for t in tables:
        title_tag = t.find_previous("th", class_="ddtitle")
        if not title_tag:
            continue

        full_title = title_tag.text.strip()
        #  Example: "CSCE 1101 - Introduction to Computing - CRN: 12345"
        parts = full_title.split(" - ")
        course_id = parts[0]
        name = parts[1]
        crn = parts[2].replace("CRN: ", "")

        rows = t.find_all("tr")[1:]  # skip header

        for row in rows:
            cols = [c.text.strip() for c in row.find_all("td")]
            if len(cols) < 10:
                continue

            days = cols[1]
            time = cols[2]
            room = cols[3]
            instructor = cols[6]
            cap_max = cols[7]
            cap_current = cols[8]
            wl_max = cols[9]
            wl_current = cols[10]

            results.append({
                "CourseID": course_id,
                "Name": name,
                "CRN": int(crn),
                "Instructor": instructor,
                "TimeOfWeek": days,
                "Time": time,
                "Room": room,
                "Credits": None,  # Banner rarely shows it in table
                "CapacityMax": int(cap_max) if cap_max.isdigit() else None,
                "CapacityCurrent": int(cap_current) if cap_current.isdigit() else None,
                "WaitlistMax": int(wl_max) if wl_max.isdigit() else None,
                "WaitlistCurrent": int(wl_current) if wl_current.isdigit() else None
            })

    return results


all_courses = []

for subject in SUBJECTS:
    print(f"Fetching {subject}...")
    data = {
        "term_in": TERM,
        "subj_in": subject,
        "crse_in": "",
        "crn_in": ""
    }
    r = requests.post(BASE_URL, data=data)
    parsed = parse_course_table(r.text)
    all_courses.extend(parsed)

print("Done.")
print(all_courses)
