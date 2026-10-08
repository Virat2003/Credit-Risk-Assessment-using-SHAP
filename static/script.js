/*
|--------------------------------------------------------------------------
| CREDIT RISK ANALYZER
|--------------------------------------------------------------------------
|
| The frontend and FastAPI backend are served from the same domain.
|
| Local:
| http://127.0.0.1:8000
|
| Render:
| https://your-app.onrender.com
|
| Leaving this empty automatically uses the current domain.
|--------------------------------------------------------------------------
*/

const API_URL = "";


/*
|--------------------------------------------------------------------------
| DOM ELEMENTS
|--------------------------------------------------------------------------
*/

const form = document.getElementById("riskForm");
const analyzeButton = document.getElementById("analyzeButton");
const sampleButton = document.getElementById("sampleButton");

const emptyState = document.getElementById("emptyState");
const resultContent = document.getElementById("resultContent");

const probabilityValue =
    document.getElementById("probabilityValue");

const thresholdValue =
    document.getElementById("thresholdValue");

const predictionValue =
    document.getElementById("predictionValue");

const riskLabel =
    document.getElementById("riskLabel");

const riskResult =
    document.getElementById("riskResult");

const riskIcon =
    document.getElementById("riskIcon");

const resultTitle =
    document.getElementById("resultTitle");

const resultDescription =
    document.getElementById("resultDescription");

const gaugeProgress =
    document.getElementById("gaugeProgress");

const toast =
    document.getElementById("toast");


/*
|--------------------------------------------------------------------------
| SAMPLE DATA
|--------------------------------------------------------------------------
|
| A realistic low-risk example.
|
|--------------------------------------------------------------------------
*/

const sampleData = {
    person_age: 35,
    person_income: 75000,
    person_home_ownership: "OWN",
    person_emp_length: 10,
    loan_intent: "HOMEIMPROVEMENT",
    loan_grade: "A",
    loan_amnt: 8000,
    loan_int_rate: 7.5,
    loan_percent_income: 0.11,
    cb_person_default_on_file: "N",
    cb_person_cred_hist_length: 12
};


/*
|--------------------------------------------------------------------------
| TOAST NOTIFICATION
|--------------------------------------------------------------------------
*/

let toastTimer = null;

function showToast(message) {

    if (!toast) {
        return;
    }

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}


/*
|--------------------------------------------------------------------------
| SAMPLE DATA
|--------------------------------------------------------------------------
*/

if (sampleButton) {

    sampleButton.addEventListener("click", () => {

        Object.entries(sampleData).forEach(([key, value]) => {

            const input = document.getElementById(key);

            if (input) {
                input.value = value;
            }

        });

        showToast("Example applicant loaded.");

    });

}


/*
|--------------------------------------------------------------------------
| GET FORM DATA
|--------------------------------------------------------------------------
*/

function getFormData() {

    return {

        person_age:
            Number(
                document.getElementById("person_age").value
            ),

        person_income:
            Number(
                document.getElementById("person_income").value
            ),

        person_home_ownership:
            document.getElementById(
                "person_home_ownership"
            ).value,

        person_emp_length:
            Number(
                document.getElementById("person_emp_length").value
            ),

        loan_intent:
            document.getElementById("loan_intent").value,

        loan_grade:
            document.getElementById("loan_grade").value,

        loan_amnt:
            Number(
                document.getElementById("loan_amnt").value
            ),

        loan_int_rate:
            Number(
                document.getElementById("loan_int_rate").value
            ),

        loan_percent_income:
            Number(
                document.getElementById("loan_percent_income").value
            ),

        cb_person_default_on_file:
            document.getElementById(
                "cb_person_default_on_file"
            ).value,

        cb_person_cred_hist_length:
            Number(
                document.getElementById(
                    "cb_person_cred_hist_length"
                ).value
            )

    };

}


/*
|--------------------------------------------------------------------------
| VALIDATE FORM VALUES
|--------------------------------------------------------------------------
*/

function validateData(data) {

    if (!Number.isFinite(data.person_age) ||
        data.person_age <= 0) {

        return "Please enter a valid age.";

    }


    if (!Number.isFinite(data.person_income) ||
        data.person_income <= 0) {

        return "Please enter a valid annual income.";

    }


    if (!Number.isFinite(data.person_emp_length) ||
        data.person_emp_length < 0) {

        return "Please enter a valid employment length.";

    }


    if (!Number.isFinite(data.loan_amnt) ||
        data.loan_amnt <= 0) {

        return "Please enter a valid loan amount.";

    }


    if (!Number.isFinite(data.loan_int_rate) ||
        data.loan_int_rate < 0) {

        return "Please enter a valid interest rate.";

    }


    if (!Number.isFinite(data.loan_percent_income) ||
        data.loan_percent_income < 0) {

        return "Please enter a valid loan-to-income ratio.";

    }


    if (!Number.isFinite(data.cb_person_cred_hist_length) ||
        data.cb_person_cred_hist_length < 0) {

        return "Please enter a valid credit history length.";

    }


    return null;
}


/*
|--------------------------------------------------------------------------
| BUTTON LOADING STATE
|--------------------------------------------------------------------------
*/

function setLoading(isLoading) {

    if (!analyzeButton) {
        return;
    }

    if (isLoading) {

        analyzeButton.classList.add("loading");

        const buttonText =
            analyzeButton.querySelector("span");

        if (buttonText) {
            buttonText.textContent = "Analyzing...";
        }

        analyzeButton.disabled = true;

    } else {

        analyzeButton.classList.remove("loading");

        const buttonText =
            analyzeButton.querySelector("span");

        if (buttonText) {
            buttonText.textContent = "Analyze risk";
        }

        analyzeButton.disabled = false;

    }

}


/*
|--------------------------------------------------------------------------
| GAUGE
|--------------------------------------------------------------------------
*/

function updateGauge(probability, risk) {

    if (!gaugeProgress) {
        return;
    }

    /*
    | The circumference depends on the SVG circle.
    | This value matches the gauge used in the UI.
    */

    const circumference = 553;

    const percentage =
        Math.min(
            Math.max(probability, 0),
            1
        );

    const offset =
        circumference -
        (percentage * circumference);


    /*
    | Start the animation from zero.
    */

    gaugeProgress.style.strokeDasharray =
        circumference;

    gaugeProgress.style.strokeDashoffset =
        circumference;


    /*
    | Force browser to register the initial state.
    */

    requestAnimationFrame(() => {

        gaugeProgress.style.strokeDashoffset =
            offset;

    });


    /*
    |--------------------------------------------------------------------------
    | Risk colors
    |--------------------------------------------------------------------------
    */

    let color = "#40d69a";


    if (risk === "medium") {
        color = "#f4c95d";
    }


    if (risk === "high") {
        color = "#ff6878";
    }


    gaugeProgress.style.stroke = color;

    gaugeProgress.style.filter =
        `drop-shadow(0 0 7px ${color}40)`;

}


/*
|--------------------------------------------------------------------------
| FORMAT NUMBER
|--------------------------------------------------------------------------
*/

function formatPercentage(value) {

    return `${(value * 100).toFixed(1)}%`;

}


/*
|--------------------------------------------------------------------------
| DISPLAY RESULT
|--------------------------------------------------------------------------
*/

function displayResult(result) {

    const probability =
        Number(result.default_probability);

    const threshold =
        Number(result.default_threshold);

    const prediction =
        Number(result.default_prediction);


    /*
    |--------------------------------------------------------------------------
    | Validate API response
    |--------------------------------------------------------------------------
    */

    if (!Number.isFinite(probability)) {

        throw new Error(
            "The API returned an invalid probability."
        );

    }


    if (!Number.isFinite(threshold)) {

        throw new Error(
            "The API returned an invalid threshold."
        );

    }


    if (![0, 1].includes(prediction)) {

        throw new Error(
            "The API returned an invalid prediction."
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Determine visual risk
    |--------------------------------------------------------------------------
    |
    | The model prediction is authoritative.
    |
    | 0 = Low Risk
    | 1 = High Risk
    |
    | "Medium" is only a visual indication for probabilities
    | approaching the threshold while the model still predicts 0.
    |--------------------------------------------------------------------------
    */

    let risk = "low";


    if (prediction === 1) {

        risk = "high";

    }

    else if (probability >= threshold * 0.7) {

        risk = "medium";

    }


    /*
    |--------------------------------------------------------------------------
    | Show result panel
    |--------------------------------------------------------------------------
    */

    if (emptyState) {
        emptyState.classList.add("hidden");
    }

    if (resultContent) {
        resultContent.classList.remove("hidden");
    }


    /*
    |--------------------------------------------------------------------------
    | Probability
    |--------------------------------------------------------------------------
    */

    if (probabilityValue) {

        probabilityValue.textContent =
            formatPercentage(probability);

    }


    /*
    |--------------------------------------------------------------------------
    | Threshold
    |--------------------------------------------------------------------------
    */

    if (thresholdValue) {

        thresholdValue.textContent =
            formatPercentage(threshold);

    }


    /*
    |--------------------------------------------------------------------------
    | Prediction
    |--------------------------------------------------------------------------
    */

    if (predictionValue) {

        predictionValue.textContent =
            prediction === 1
                ? "High Risk"
                : "Low Risk";

    }


    /*
    |--------------------------------------------------------------------------
    | LOW RISK
    |--------------------------------------------------------------------------
    */

    if (risk === "low") {

        if (riskLabel) {

            riskLabel.textContent =
                "LOW RISK";

            riskLabel.style.color =
                "#40d69a";

            riskLabel.style.background =
                "rgba(64, 214, 154, 0.08)";

            riskLabel.style.borderColor =
                "rgba(64, 214, 154, 0.13)";

        }


        if (riskIcon) {

            riskIcon.textContent = "✓";

            riskIcon.style.color =
                "#40d69a";

            riskIcon.style.background =
                "rgba(64, 214, 154, 0.10)";

        }


        if (resultTitle) {

            resultTitle.textContent =
                "Low Risk";

        }


        if (resultDescription) {

            resultDescription.textContent =
                "The model indicates a relatively lower probability of default.";

        }

    }


    /*
    |--------------------------------------------------------------------------
    | MEDIUM / WATCH
    |--------------------------------------------------------------------------
    */

    else if (risk === "medium") {

        if (riskLabel) {

            riskLabel.textContent =
                "WATCH";

            riskLabel.style.color =
                "#f4c95d";

            riskLabel.style.background =
                "rgba(244, 201, 93, 0.08)";

            riskLabel.style.borderColor =
                "rgba(244, 201, 93, 0.13)";

        }


        if (riskIcon) {

            riskIcon.textContent = "•";

            riskIcon.style.color =
                "#f4c95d";

            riskIcon.style.background =
                "rgba(244, 201, 93, 0.10)";

        }


        if (resultTitle) {

            resultTitle.textContent =
                "Elevated Risk";

        }


        if (resultDescription) {

            resultDescription.textContent =
                "The probability is approaching the model's decision threshold.";

        }

    }


    /*
    |--------------------------------------------------------------------------
    | HIGH RISK
    |--------------------------------------------------------------------------
    */

    else {

        if (riskLabel) {

            riskLabel.textContent =
                "HIGH RISK";

            riskLabel.style.color =
                "#ff6878";

            riskLabel.style.background =
                "rgba(255, 104, 120, 0.08)";

            riskLabel.style.borderColor =
                "rgba(255, 104, 120, 0.13)";

        }


        if (riskIcon) {

            riskIcon.textContent = "!";

            riskIcon.style.color =
                "#ff6878";

            riskIcon.style.background =
                "rgba(255, 104, 120, 0.10)";

        }


        if (resultTitle) {

            resultTitle.textContent =
                "High Risk";

        }


        if (resultDescription) {

            resultDescription.textContent =
                "The model indicates a higher probability of default.";

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Animate gauge
    |--------------------------------------------------------------------------
    */

    updateGauge(
        probability,
        risk
    );


    /*
    |--------------------------------------------------------------------------
    | Result animation
    |--------------------------------------------------------------------------
    */

    if (resultContent) {

        resultContent.classList.remove(
            "result-updated"
        );

        requestAnimationFrame(() => {

            resultContent.classList.add(
                "result-updated"
            );

        });

    }

}


/*
|--------------------------------------------------------------------------
| API REQUEST
|--------------------------------------------------------------------------
*/

async function predictRisk(data) {

    const response = await fetch(
        `${API_URL}/predict`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        }
    );


    /*
    |--------------------------------------------------------------------------
    | Handle HTTP errors
    |--------------------------------------------------------------------------
    */

    if (!response.ok) {

        let message =
            `Server returned ${response.status}.`;

        try {

            const errorData =
                await response.json();

            if (errorData.detail) {

                if (typeof errorData.detail === "string") {

                    message =
                        errorData.detail;

                }

                else {

                    message =
                        JSON.stringify(
                            errorData.detail
                        );

                }

            }

        }

        catch (_) {

            // Response wasn't JSON.

        }


        throw new Error(message);

    }


    const result =
        await response.json();


    return result;

}


/*
|--------------------------------------------------------------------------
| FORM SUBMISSION
|--------------------------------------------------------------------------
*/

if (form) {

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            /*
            |--------------------------------------------------------------------------
            | Browser validation
            |--------------------------------------------------------------------------
            */

            if (!form.checkValidity()) {

                form.reportValidity();

                return;

            }


            /*
            |--------------------------------------------------------------------------
            | Collect form data
            |--------------------------------------------------------------------------
            */

            const data =
                getFormData();


            /*
            |--------------------------------------------------------------------------
            | Custom validation
            |--------------------------------------------------------------------------
            */

            const validationError =
                validateData(data);


            if (validationError) {

                showToast(
                    validationError
                );

                return;

            }


            /*
            |--------------------------------------------------------------------------
            | Start loading
            |--------------------------------------------------------------------------
            */

            setLoading(true);


            try {

                /*
                | Send data to FastAPI.
                */

                const result =
                    await predictRisk(data);


                /*
                | Display model result.
                */

                displayResult(result);


                /*
                | Optional success notification.
                */

                showToast(
                    "Risk analysis completed."
                );

            }


            catch (error) {

                console.error(
                    "Prediction error:",
                    error
                );


                /*
                |--------------------------------------------------------------------------
                | Friendly error message
                |--------------------------------------------------------------------------
                */

                let message =
                    "Unable to connect to the prediction API.";


                if (
                    error &&
                    error.message
                ) {

                    message =
                        error.message;

                }


                showToast(message);

            }


            finally {

                setLoading(false);

            }

        }
    );

}


/*
|--------------------------------------------------------------------------
| INITIAL GAUGE STATE
|--------------------------------------------------------------------------
*/

if (gaugeProgress) {

    gaugeProgress.style.strokeDasharray =
        "553";

    gaugeProgress.style.strokeDashoffset =
        "553";

}


/*
|--------------------------------------------------------------------------
| KEYBOARD / UX ENHANCEMENT
|--------------------------------------------------------------------------
|
| Pressing Enter inside a normal input submits the form naturally.
| This section only prevents accidental double submissions while loading.
|--------------------------------------------------------------------------
*/

if (form) {

    form.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                analyzeButton &&
                analyzeButton.disabled
            ) {

                event.preventDefault();

            }

        }
    );

}


/*
|--------------------------------------------------------------------------
| PAGE READY
|--------------------------------------------------------------------------
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "Credit Risk Analyzer loaded."
        );

    }
);