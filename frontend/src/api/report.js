const REPORT_URL = "/api"


export function report(ip_address){
    return fetch(`${REPORT_URL}/report/`, {
        method:"POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ ip_address }),
    });
}

export function grade(grade, alias) {
    return fetch(`${REPORT_URL}/change_status/`, {
        method:"POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ grade, alias }),
    });
}

export function getArchitects(){
    return fetch(`${REPORT_URL}/architectors/`, {
        method:"GET",
        headers: {"Content-Type":"application/json"},
    });
}
