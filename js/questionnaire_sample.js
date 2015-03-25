//SUMMARY OF SPECIFIC QUESTION TYPES

// VAS
// "using the line below, please rate"
// stem
// slider (values 0-100) with anchors on each side, may be randomly switched

// QIDS
// "Please select the one response that best describes you for the past n days"
// stem
// 4 anchors/choices

// ASRM
// "Choose which statement best describes the way you have been feeling for the past n days"
// 5 anchors/choices

// OTHER
// "Please indicate"
// stem
// 2 anchors/choices


var results = {
   "patientID":"clau",
   "sessionID":1673,
   "date":"2015-03-13T20:14:18.664Z",
   "answers":[
      {
         "id":"QIDS_1",
         "answer":"Anchor_0"
      },
      {
         "id":"VAS_8",
         "answer":"65",
         "flipped":0
      },
      {
         "id":"QIDS_9",
         "answer":"Anchor_1"
      },
      {
         "id":"QIDS_10",
         "answer":"Anchor_0"
      },
      {
         "id":"OTHER_1",
         "answer":"Anchor_0"
      },
      {
         "id":"QIDS_7",
         "answer":"Anchor_0"
      },
      {
         "id":"VAS_6",
         "answer":"27",
         "flipped":1
      },
      {
         "id":"QIDS_0",
         "answer":"Anchor_1"
      },
      {
         "id":"QIDS_2",
         "answer":"Anchor_0"
      },
      {
         "id":"VAS_1",
         "answer":"29",
         "flipped":0
      },
      {
         "id":"VAS_3",
         "answer":"56",
         "flipped":0
      },
      {
         "id":"QIDS_3",
         "answer":"Anchor_0"
      },
      {
         "id":"ASRM_1",
         "answer":"Anchor_1"
      },
      {
         "id":"ASRM_3",
         "answer":"Anchor_0"
      },
      {
         "id":"VAS_2",
         "answer":"56",
         "flipped":0
      },
      {
         "id":"ASRM_2",
         "answer":"Anchor_0"
      },
      {
         "id":"VAS_5",
         "answer":"23",
         "flipped":0
      },
      {
         "id":"QIDS_5",
         "answer":"Anchor_1"
      },
      {
         "id":"VAS_4",
         "answer":"52",
         "flipped":0
      },
      {
         "id":"QIDS_8",
         "answer":"Anchor_0"
      },
      {
         "id":"VAS_7",
         "answer":"82",
         "flipped":1
      },
      {
         "id":"ASRM_0",
         "answer":"Anchor_0"
      },
      {
         "id":"ASRM_4",
         "answer":"Anchor_0"
      },
      {
         "id":"QIDS_4",
         "answer":"Anchor_2"
      },
      {
         "id":"VAS_0",
         "answer":"21",
         "flipped":1
      },
      {
         "id":"OTHER_0",
         "answer":"Anchor_0"
      },
      {
         "id":"QIDS_6",
         "answer":"Anchor_0"
      },
      {
         "id":"QIDS_11",
         "answer":"Anchor_1"
      },
      {
         "id":"comments",
         "answer":"Testing on Chrome on PC.\nWorking with new libraries."
      },
      {
         "id":"tags",
         "answer":"testing"
      }
   ],
   "patientEmail":"cindy.lau@axs3d.com"
}

var questionnaire = {
   "result":1,
   "test":"test",
   "sessionID":1673,
   "patientID":"clau",
   "randomize":1,
   "flip":1,
   "infreq":1,
   "questions":[
      {
         "questionID":"QIDS_0",
         "stem":"Have you been feeling sad?",
         "days":1,
         "anchors":[
            "I didn't feel sad.",
            "I felt sad less than half the time.",
            "I felt sad more than half the time.",
            "I felt sad nearly all of the time."
         ]
      },
      {
         "questionID":"QIDS_1",
         "stem":"Has your appetite decreased?",
         "days":1,
         "anchors":[
            "There was no decrease in my usual appetite.",
            "I ate somewhat less often or lesser amounts of food than usual.",
            "I ate much less than usual and only with personal effort.",
            "I rarely ate within a 24-hour period, and only with really forcing myself to eat or when others persuaded me to eat."
         ]
      },
      {
         "questionID":"QIDS_2",
         "stem":"Has your appetite increased?",
         "days":1,
         "anchors":[
            "There was no increase in my usual appetite.",
            "I felt a need to eat more frequently than usual.",
            "I regularly ate more often and\/or greater amounts of food.",
            "I felt driven to overeat both at mealtime and between meals."
         ]
      },
      {
         "questionID":"QIDS_3",
         "stem":"Has your weight decreased?",
         "days":1,
         "anchors":[
            "My weight has not decreased.",
            "I feel as if I've  had a slight weight loss.",
            "I have lost 2 pounds or more.",
            "I have lost 5 pounds or more."
         ]
      },
      {
         "questionID":"QIDS_4",
         "stem":"Has your weight increased?",
         "days":1,
         "anchors":[
            "My weight has not increased.",
            "I feel as if I've had a slight weight gain.",
            "I have gained 2 pounds or more.",
            "I have gained 5 pounds or more."
         ]
      },
      {
         "questionID":"QIDS_5",
         "stem":"Have you had difficulty with concentration or decision-making?",
         "days":1,
         "anchors":[
            "There was no change in my usual capacity to concentrate or make decisions.",
            "I occasionally felt indecisive or found that my attention wandered.",
            "Most of the time, I found it hard to focus or make decisions.",
            "I couldn't concentrate well enough to read or I couldn't make even minor decisions."
         ]
      },
      {
         "questionID":"QIDS_6",
         "stem":"How have you been feeling about yourself?",
         "days":1,
         "anchors":[
            "I saw myself as equally worthwhile and deserving as other people.",
            "I put the blame on myself more than usual.",
            "For the most part, I believed that I caused problems for others.",
            "I thought almost constantly about major and minor defects in myself."
         ]
      },
      {
         "questionID":"QIDS_7",
         "stem":"How much have you been thinking about suicide or death?",
         "days":1,
         "anchors":[
            "I didn't think of suicide or death.",
            "I felt that life was empty or wondered if it was worth living.",
            "I thought of suicide or death several times a week for several minutes.",
            "I thought of suicide or death several times a day in some detail, or I made specific plans for suicide or actually tried to take my life."
         ]
      },
      {
         "questionID":"QIDS_8",
         "stem":"How has your general level of interest been?",
         "days":1,
         "anchors":[
            "There was no change from usual in how interested I am in other people or activities.",
            "I noticed that I was less interested in other people or activities.",
            "I found I had interest in only 1 or 2 of the activities I used to do",
            "I had virtually no interest in the activities I used to do."
         ]
      },
      {
         "questionID":"QIDS_9",
         "stem":"How energetic have you been feeling?",
         "days":1,
         "anchors":[
            "There was no change in my usual level of energy.",
            "I got tired more easily than usual.",
            "I had to make a big effort to start or finish my usual daily activities (for example, shopping, homework, cooking, or going to work).",
            "I really couldn't carry out most of my usual daily activities because I just didn't have the energy."
         ]
      },
      {
         "questionID":"QIDS_10",
         "stem":"How sluggish have you been feeling?",
         "days":1,
         "anchors":[
            "I thought, spoke, and moved at my usual pace.",
            "I found that my thinking was more sluggish than usual or my voice sounded dull or flat.",
            "It took me several seconds to respond to most questions and I was sure my thinking was more sluggish than usual.",
            "I was often unable to respond to questions without forcing myself."
         ]
      },
      {
         "questionID":"QIDS_11",
         "stem":"How restless have you been feeling?",
         "days":1,
         "anchors":[
            "I didn't feel restless.",
            "I was often fidgety, wringing my hands, or needing to change my sitting position.",
            "I had sudden impulses to move about and was quite restless. Been increased compared to how it normally is.",
            "At times, I was unable to stay seated and needed to pace around."
         ]
      },
      {
         "questionID":"ASRM_0",
         "stem":"",
         "days":1,
         "anchors":[
            "I do not feel happier or more cheerful than usual.",
            "I occasionally feel happier or more cheerful than usual.",
            "I often feel happier or more cheerful than usual.",
            "I feel happier or more cheerful than usual most of the time.",
            "I feel happier or more cheerful than usual all of the time."
         ]
      },
      {
         "questionID":"ASRM_1",
         "stem":"",
         "days":1,
         "anchors":[
            "I do not feel more self-confident than usual.",
            "I occasionally feel more self-confident than usual.",
            "I often feel more self-confident than usual.",
            "I feel more self-confident than usual.",
            "I feel extremely self-confident all of the time."
         ]
      },
      {
         "questionID":"ASRM_2",
         "stem":"",
         "days":1,
         "anchors":[
            "I do not need less sleep than usual.",
            "I occasionally need less sleep than usual.",
            "I often need less sleep than usual.",
            "I frequently need less sleep than usual.",
            "I can go all day and night without any sleep and still not feel tired."
         ]
      },
      {
         "questionID":"ASRM_3",
         "stem":"",
         "days":1,
         "anchors":[
            "I do not talk more than usual.",
            "I occasionally talk more than usual.",
            "I often talk more than usual.",
            "I frequently talk more than usual.",
            "I talk constantly and cannot be interrupted."
         ]
      },
      {
         "questionID":"ASRM_4",
         "stem":"",
         "days":1,
         "anchors":[
            "I have not been more active (either socially, sexually, at work, home or school) than usual.",
            "I have occasionally been more active than usual.",
            "I have often been more active than usual.",
            "I have frequently been more active than usual.",
            "I am constantly active or on the go all the time."
         ]
      },
      {
         "questionID":"OTHER_0",
         "stem":"Have you been admitted to a hospital",
         "days":1,
         "anchors":[
            "No",
            "Yes"
         ]
      },
      {
         "questionID":"OTHER_1",
         "stem":"Have you visited the Emergency Room",
         "days":1,
         "anchors":[
            "No",
            "Yes"
         ]
      },
      {
         "questionID":"VAS_0",
         "stem":"your current mood",
         "days":1,
         "anchors":[
            "Worst ever",
            "Best ever"
         ]
      },
      {
         "questionID":"VAS_1",
         "stem":"your current level of anger or irritability",
         "days":1,
         "anchors":[
            "Not at all irritable",
            "Extremely irritable"
         ]
      },
      {
         "questionID":"VAS_2",
         "stem":"the length of time from dawn to dusk",
         "days":1,
         "anchors":[
            "Shortest day of year",
            "Longest day of year"
         ]
      },
      {
         "questionID":"VAS_3",
         "stem":"your current level of worriedness or fearfulness",
         "days":1,
         "anchors":[
            "Not fearful \/ worried at all",
            "Extremely fearful \/ worried"
         ]
      },
      {
         "questionID":"VAS_4",
         "stem":"how much you slept in the past 24 hours",
         "days":1,
         "anchors":[
            "4 or fewer hours",
            "12 or more hours"
         ]
      },
      {
         "questionID":"VAS_5",
         "stem":"how frantic you are to avoid being lonely",
         "days":1,
         "anchors":[
            "Not at all frantic",
            "Extremely frantic"
         ]
      },
      {
         "questionID":"VAS_6",
         "stem":"the state of relationships in your life",
         "days":1,
         "anchors":[
            "Completely calm or stable",
            "Completely unsettled"
         ]
      },
      {
         "questionID":"VAS_7",
         "stem":"how much you have been taking your prescribed medications and treatments",
         "days":1,
         "anchors":[
            "0%",
            "100%"
         ]
      },
      {
         "questionID":"VAS_8",
         "stem":"the quality of your sleep last night",
         "days":1,
         "anchors":[
            "Worst ever",
            "Best ever"
         ]
      }
   ]
};