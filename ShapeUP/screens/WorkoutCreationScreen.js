import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import Checkbox from 'expo-checkbox';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const fetchBaselineTestData = async (userId) => {
  const docRef = doc(db, 'baselineTests', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.log('No such document!');
    return null;
  }
};

const callOpenAI = async (input, userBaselineTest) => {
  const apiKey = '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';
  const endpoint = 'https://api.openai.com/v1/chat/completions';
  const modelIdentifier = 'gpt-4-1106-preview';

  const exercisesList = `(3/4 Sit-Up,beginner,Body Only,Abdominals), (90/90 Hamstring,beginner,Body Only,Hamstrings), (Ab Crunch Machine,intermediate,Full Gym,Abdominals), (Ab Roller,intermediate,Full Gym,Abdominals), (Adductor,intermediate,Home Gym,Adductors), (Adductor/Groin,intermediate,Full Gym,Adductors), (Advanced Kettlebell Windmill,intermediate,Home Gym,Abdominals), (Air Bike,beginner,Body Only,Abdominals), (All Fours Quad Stretch,intermediate,Body Only,Quadriceps), (Alternate Hammer Curl,beginner,Home Gym,Biceps), (Alternate Heel Touchers,beginner,Body Only,Abdominals), (Alternate Incline Dumbbell Curl,beginner,Home Gym,Biceps), (Alternate Leg Diagonal Bound,beginner,Full Gym,Quadriceps), (Alternating Cable Shoulder Press,beginner,Full Gym,Shoulders), (Alternating Deltoid Raise,beginner,Home Gym,Shoulders), (Alternating Floor Press,beginner,Home Gym,Chest), (Alternating Hang Clean,intermediate,Home Gym,Hamstrings), (Alternating Kettlebell Press,intermediate,Home Gym,Shoulders), (Alternating Kettlebell Row,intermediate,Home Gym,Middle back), (Alternating Renegade Row,expert,Home Gym,Middle back), (Ankle Circles,beginner,Full Gym,Calves), (Ankle On The Knee,beginner,Full Gym,Glutes), (Anterior Tibialis-SMR,intermediate,Full Gym,Calves), (Anti-Gravity Press,beginner,Full Gym,Shoulders), (Arm Circles,beginner,Full Gym,Shoulders), (Arnold Dumbbell Press,intermediate,Home Gym,Shoulders), (Around The Worlds,intermediate,Home Gym,Chest), (Atlas Stones,expert,Full Gym,Lower back), (Atlas Stone Trainer,intermediate,Full Gym,Lower back), (Axle Deadlift,intermediate,Full Gym,Lower back), (Backward Drag,beginner,Full Gym,Quadriceps), (Backward Medicine Ball Throw,beginner,Home Gym,Shoulders), (Back Flyes - With Bands,beginner,Home Gym,Shoulders), (Balance Board,beginner,Full Gym,Calves), (Ball Leg Curl,beginner,Full Gym,Hamstrings), (Band Assisted Pull-Up,beginner,Full Gym,Lats), (Band Good Morning,beginner,Home Gym,Hamstrings), (Band Good Morning (Pull Through),beginner,Home Gym,Hamstrings), (Band Hip Adductions,beginner,Home Gym,Adductors), (Band Pull Apart,beginner,Home Gym,Shoulders), (Band Skull Crusher,beginner,Home Gym,Triceps), (Barbell Ab Rollout,intermediate,Full Gym,Abdominals), (Barbell Ab Rollout - On Knees,expert,Full Gym,Abdominals), (Barbell Bench Press - Medium Grip,beginner,Full Gym,Chest), (Barbell Curl,beginner,Full Gym,Biceps), (Barbell Curls Lying Against An Incline,beginner,Full Gym,Biceps), (Barbell Deadlift,intermediate,Full Gym,Lower back), (Barbell Full Squat,intermediate,Full Gym,Quadriceps), (Barbell Glute Bridge,intermediate,Full Gym,Glutes), (Barbell Guillotine Bench Press,intermediate,Full Gym,Chest), (Barbell Hack Squat,intermediate,Full Gym,Quadriceps), (Barbell Hip Thrust,intermediate,Full Gym,Glutes), (Barbell Incline Bench Press - Medium Grip,beginner,Full Gym,Chest), (Barbell Incline Shoulder Raise,beginner,Full Gym,Shoulders), (Barbell Lunge,intermediate,Full Gym,Quadriceps), (Barbell Rear Delt Row,beginner,Full Gym,Shoulders), (Barbell Rollout from Bench,intermediate,Full Gym,Abdominals), (Barbell Seated Calf Raise,beginner,Full Gym,Calves), (Barbell Shoulder Press,intermediate,Full Gym,Shoulders), (Barbell Shrug,beginner,Full Gym,Traps), (Barbell Shrug Behind The Back,beginner,Full Gym,Traps), (Barbell Side Bend,beginner,Full Gym,Abdominals), (Barbell Side Split Squat,beginner,Full Gym,Quadriceps), (Barbell Squat,beginner,Full Gym,Quadriceps), (Barbell Squat To A Bench,expert,Full Gym,Quadriceps), (Barbell Step Ups,intermediate,Full Gym,Quadriceps), (Barbell Walking Lunge,beginner,Full Gym,Quadriceps), (Battling Ropes,beginner,Full Gym,Shoulders), (Bear Crawl Sled Drags,beginner,Full Gym,Quadriceps), (Behind Head Chest Stretch,expert,Full Gym,Chest), (Bench Dips,beginner,Body Only,Triceps), (Bench Jump,intermediate,Body Only,Quadriceps), (Bench Press - Powerlifting,intermediate,Full Gym,Triceps), (Bench Press - With Bands,beginner,Home Gym,Chest), (Bench Press with Chains,expert,Full Gym,Triceps), (Bench Sprint,beginner,Full Gym,Quadriceps), (Bent-Arm Barbell Pullover,intermediate,Full Gym,Lats), (Bent-Arm Dumbbell Pullover,intermediate,Home Gym,Chest), (Bent-Knee Hip Raise,beginner,Body Only,Abdominals), (Bent Over Barbell Row,beginner,Full Gym,Middle back), (Bent Over Dumbbell Rear Delt Raise With Head On Bench,beginner,Home Gym,Shoulders), (Bent Over Low-Pulley Side Lateral,beginner,Full Gym,Shoulders), (Bent Over One-Arm Long Bar Row,beginner,Full Gym,Middle back), (Bent Over Two-Arm Long Bar Row,intermediate,Full Gym,Middle back), (Bent Over Two-Dumbbell Row,beginner,Home Gym,Middle back), (Bent Over Two-Dumbbell Row With Palms In,beginner,Home Gym,Middle back), (Bent Press,expert,Home Gym,Abdominals), (Bicycling,beginner,Full Gym,Quadriceps), (Bicycling, Stationary,beginner,Full Gym,Quadriceps), (Board Press,intermediate,Full Gym,Triceps), (Body-Up,intermediate,Body Only,Triceps), (Bodyweight Flyes,intermediate,Full Gym,Chest), (Bodyweight Mid Row,intermediate,Full Gym,Middle back), (Bodyweight Squat,beginner,Body Only,Quadriceps), (Bodyweight Walking Lunge,beginner,Full Gym,Quadriceps), (Body Tricep Press,beginner,Body Only,Triceps), (Bosu Ball Cable Crunch With Side Bends,beginner,Full Gym,Abdominals), (Bottoms-Up Clean From The Hang Position,intermediate,Home Gym,Forearms), (Bottoms Up,beginner,Body Only,Abdominals), (Box Jump (Multiple Response),beginner,Full Gym,Hamstrings), (Box Skip,beginner,Full Gym,Hamstrings), (Box Squat,intermediate,Full Gym,Quadriceps), (Box Squat with Bands,expert,Full Gym,Quadriceps), (Box Squat with Chains,expert,Full Gym,Quadriceps), (Brachialis-SMR,intermediate,Home Gym,Biceps), (Bradford/Rocky Presses,beginner,Full Gym,Shoulders), (Butt-Ups,beginner,Body Only,Abdominals), (Butterfly,beginner,Full Gym,Chest), (Butt Lift (Bridge),beginner,Body Only,Glutes), (Cable Chest Press,beginner,Full Gym,Chest), (Cable Crossover,beginner,Full Gym,Chest), (Cable Crunch,beginner,Full Gym,Abdominals), (Cable Deadlifts,beginner,Full Gym,Quadriceps), (Cable Hammer Curls - Rope Attachment,beginner,Full Gym,Biceps), (Cable Hip Adduction,beginner,Full Gym,Quadriceps), (Cable Incline Pushdown,beginner,Full Gym,Lats), (Cable Incline Triceps Extension,beginner,Full Gym,Triceps), (Cable Internal Rotation,beginner,Full Gym,Shoulders), (Cable Iron Cross,beginner,Full Gym,Chest), (Cable Judo Flip,beginner,Full Gym,Abdominals), (Cable Lying Triceps Extension,beginner,Full Gym,Triceps), (Cable One Arm Tricep Extension,beginner,Full Gym,Triceps), (Cable Preacher Curl,beginner,Full Gym,Biceps), (Cable Rear Delt Fly,beginner,Full Gym,Shoulders), (Cable Reverse Crunch,beginner,Full Gym,Abdominals), (Cable Rope Overhead Triceps Extension,beginner,Full Gym,Triceps), (Cable Rope Rear-Delt Rows,beginner,Full Gym,Shoulders), (Cable Russian Twists,beginner,Full Gym,Abdominals), (Cable Seated Crunch,beginner,Full Gym,Abdominals), (Cable Seated Lateral Raise,beginner,Full Gym,Shoulders), (Cable Shoulder Press,beginner,Full Gym,Shoulders), (Cable Shrugs,beginner,Full Gym,Traps), (Cable Wrist Curl,beginner,Full Gym,Forearms), (Calf-Machine Shoulder Shrug,beginner,Full Gym,Traps), (Calf Press,beginner,Full Gym,Calves), (Calf Press On The Leg Press Machine,beginner,Full Gym,Calves), (Calf Raises - With Bands,beginner,Home Gym,Calves), (Calf Raise On A Dumbbell,intermediate,Home Gym,Calves), (Calf Stretch Elbows Against Wall,beginner,Full Gym,Calves), (Calf Stretch Hands Against Wall,beginner,Full Gym,Calves), (Calves-SMR,intermediate,Home Gym,Calves), (Carioca Quick Step,beginner,Full Gym,Adductors), (Car Deadlift,intermediate,Full Gym,Quadriceps), (Car Drivers,beginner,Full Gym,Shoulders), (Catch and Overhead Throw,beginner,Home Gym,Lats), (Cat Stretch,beginner,Full Gym,Lower back), (Chain Handle Extension,intermediate,Full Gym,Triceps), (Chain Press,intermediate,Full Gym,Chest), (Chair Leg Extended Stretch,beginner,Full Gym,Hamstrings), (Chair Lower Back Stretch,beginner,Full Gym,Lats), (Chair Squat,beginner,Full Gym,Quadriceps), (Chair Upper Body Stretch,beginner,Full Gym,Shoulders), (Chest And Front Of Shoulder Stretch,beginner,Full Gym,Chest), (Chest Push (multiple response),beginner,Home Gym,Chest), (Chest Push (single response),beginner,Home Gym,Chest), (Chest Push from 3 point stance,beginner,Home Gym,Chest), (Chest Push with Run Release,beginner,Home Gym,Chest), (Chest Stretch on Stability Ball,beginner,Full Gym,Chest), (Child's Pose,beginner,Full Gym,Lower back), (Chin-Up,beginner,Body Only,Lats), (Chin To Chest Stretch,beginner,Full Gym,Neck), (Circus Bell,expert,Full Gym,Shoulders), (Clean,intermediate,Full Gym,Hamstrings), (Clean and Jerk,expert,Full Gym,Shoulders), (Clean and Press,intermediate,Full Gym,Shoulders), (Clean Deadlift,beginner,Full Gym,Hamstrings), (Clean from Blocks,intermediate,Full Gym,Quadriceps), (Clean Pull,intermediate,Full Gym,Quadriceps), (Clean Shrug,beginner,Full Gym,Traps), (Clock Push-Up,intermediate,Body Only,Chest), (Close-Grip Barbell Bench Press,beginner,Full Gym,Triceps), (Close-Grip Dumbbell Press,beginner,Home Gym,Triceps), (Close-Grip EZ-Bar Curl with Band,beginner,Full Gym,Biceps), (Close-Grip EZ-Bar Press,beginner,Full Gym,Triceps), (Close-Grip EZ Bar Curl,beginner,Full Gym,Biceps), (Close-Grip Front Lat Pulldown,beginner,Full Gym,Lats), (Close-Grip Push-Up off of a Dumbbell,intermediate,Body Only,Triceps), (Close-Grip Standing Barbell Curl,beginner,Full Gym,Biceps), (Cocoons,beginner,Body Only,Abdominals), (Conan's Wheel,intermediate,Full Gym,Quadriceps), (Concentration Curls,beginner,Home Gym,Biceps), (Cross-Body Crunch,beginner,Body Only,Abdominals), (Crossover Reverse Lunge,intermediate,Full Gym,Lower back), (Cross Body Hammer Curl,beginner,Home Gym,Biceps), (Cross Over - With Bands,beginner,Home Gym,Chest), (Crucifix,beginner,Full Gym,Shoulders), (Crunches,beginner,Body Only,Abdominals), (Crunch - Hands Overhead,beginner,Body Only,Abdominals), (Crunch - Legs On Exercise Ball,beginner,Body Only,Abdominals), (Cuban Press,intermediate,Home Gym,Shoulders), (Dancer's Stretch,beginner,Full Gym,Lower back), (Deadlift with Bands,expert,Full Gym,Lower back), (Deadlift with Chains,expert,Full Gym,Lower back), (Dead Bug,beginner,Body Only,Abdominals), (Decline Barbell Bench Press,beginner,Full Gym,Chest), (Decline Close-Grip Bench To Skull Crusher,intermediate,Full Gym,Triceps), (Decline Crunch,intermediate,Body Only,Abdominals), (Decline Dumbbell Bench Press,beginner,Home Gym,Chest), (Decline Dumbbell Flyes,beginner,Home Gym,Chest), (Decline Dumbbell Triceps Extension,beginner,Home Gym,Triceps), (Decline EZ Bar Triceps Extension,beginner,Full Gym,Triceps), (Decline Oblique Crunch,beginner,Body Only,Abdominals), (Decline Push-Up,beginner,Full Gym,Chest), (Decline Reverse Crunch,beginner,Body Only,Abdominals), (Decline Smith Press,beginner,Full Gym,Chest), (Deficit Deadlift,intermediate,Full Gym,Lower back), (Depth Jump Leap,beginner,Full Gym,Quadriceps), (Dips - Chest Version,intermediate,Full Gym,Chest), (Dips - Triceps Version,beginner,Body Only,Triceps), (Dip Machine,beginner,Full Gym,Triceps), (Donkey Calf Raises,intermediate,Full Gym,Calves), (Double Kettlebell Alternating Hang Clean,intermediate,Home Gym,Hamstrings), (Double Kettlebell Jerk,intermediate,Home Gym,Shoulders), (Double Kettlebell Push Press,intermediate,Home Gym,Shoulders), (Double Kettlebell Snatch,expert,Home Gym,Shoulders), (Double Kettlebell Windmill,intermediate,Home Gym,Abdominals), (Double Leg Butt Kick,beginner,Body Only,Quadriceps), (Downward Facing Balance,intermediate,Full Gym,Glutes), (Drag Curl,intermediate,Full Gym,Biceps), (Drop Push,intermediate,Full Gym,Chest), (Dumbbell Alternate Bicep Curl,beginner,Home Gym,Biceps), (Dumbbell Bench Press,beginner,Home Gym,Chest), (Dumbbell Bench Press with Neutral Grip,beginner,Home Gym,Chest), (Dumbbell Bicep Curl,beginner,Home Gym,Biceps), (Dumbbell Clean,intermediate,Home Gym,Hamstrings), (Dumbbell Floor Press,intermediate,Home Gym,Triceps), (Dumbbell Flyes,beginner,Home Gym,Chest), (Dumbbell Incline Row,beginner,Home Gym,Middle back), (Dumbbell Incline Shoulder Raise,beginner,Home Gym,Shoulders), (Dumbbell Lunges,beginner,Home Gym,Quadriceps), (Dumbbell Lying One-Arm Rear Lateral Raise,intermediate,Home Gym,Shoulders), (Dumbbell Lying Pronation,intermediate,Home Gym,Forearms), (Dumbbell Lying Rear Lateral Raise,intermediate,Home Gym,Shoulders), (Dumbbell Lying Supination,intermediate,Home Gym,Forearms), (Dumbbell One-Arm Shoulder Press,intermediate,Home Gym,Shoulders), (Dumbbell One-Arm Triceps Extension,intermediate,Home Gym,Triceps), (Dumbbell One-Arm Upright Row,intermediate,Home Gym,Shoulders), (Dumbbell Prone Incline Curl,intermediate,Home Gym,Biceps), (Dumbbell Raise,beginner,Home Gym,Shoulders), (Dumbbell Rear Lunge,intermediate,Home Gym,Quadriceps), (Dumbbell Scaption,beginner,Home Gym,Shoulders), (Dumbbell Seated Box Jump,intermediate,Home Gym,Quadriceps), (Dumbbell Seated One-Leg Calf Raise,beginner,Home Gym,Calves), (Dumbbell Shoulder Press,intermediate,Home Gym,Shoulders), (Dumbbell Shrug,beginner,Home Gym,Traps), (Dumbbell Side Bend,beginner,Home Gym,Abdominals), (Dumbbell Squat,beginner,Home Gym,Quadriceps), (Dumbbell Squat To A Bench,intermediate,Home Gym,Quadriceps), (Dumbbell Step Ups,intermediate,Home Gym,Quadriceps), (Dumbbell Tricep Extension -Pronated Grip,beginner,Home Gym,Triceps), (Dynamic Back Stretch,beginner,Full Gym,Lats), (Dynamic Chest Stretch,beginner,Full Gym,Chest), (Elbows Back,beginner,Full Gym,Chest), (Elbow Circles,beginner,Full Gym,Shoulders), (Elbow to Knee,beginner,Body Only,Abdominals), (Elevated Back Lunge,intermediate,Full Gym,Quadriceps), (Elevated Cable Rows,intermediate,Full Gym,Lats), (Elliptical Trainer,intermediate,Full Gym,Quadriceps), (Exercise Ball Crunch,beginner,Full Gym,Abdominals), (Exercise Ball Pull-In,beginner,Full Gym,Abdominals), (Extended Range One-Arm Kettlebell Floor Press,beginner,Home Gym,Chest), (External Rotation,beginner,Home Gym,Shoulders), (External Rotation with Band,beginner,Home Gym,Shoulders), (External Rotation with Cable,beginner,Full Gym,Shoulders), (EZ-Bar Curl,beginner,Full Gym,Biceps), (EZ-Bar Skullcrusher,beginner,Full Gym,Triceps), (Face Pull,intermediate,Full Gym,Shoulders), (Farmer's Walk,intermediate,Full Gym,Forearms), (Fast Skipping,beginner,Body Only,Quadriceps), (Finger Curls,beginner,Full Gym,Forearms), (Flat Bench Cable Flyes,intermediate,Full Gym,Chest), (Flat Bench Leg Pull-In,beginner,Body Only,Abdominals), (Flat Bench Lying Leg Raise,beginner,Body Only,Abdominals), (Flexor Incline Dumbbell Curls,beginner,Home Gym,Biceps), (Floor Glute-Ham Raise,intermediate,Full Gym,Hamstrings), (Floor Press,intermediate,Full Gym,Triceps), (Floor Press with Chains,intermediate,Full Gym,Triceps), (Flutter Kicks,beginner,Body Only,Glutes), (Foot-SMR,intermediate,Full Gym,Calves), (Forward Drag with Press,intermediate,Full Gym,Chest), (Frankenstein Squat,intermediate,Full Gym,Quadriceps), (Freehand Jump Squat,intermediate,Body Only,Quadriceps), (Frog Hops,intermediate,Full Gym,Quadriceps), (Frog Sit-Ups,intermediate,Body Only,Abdominals), (Front Barbell Squat,expert,Full Gym,Quadriceps), (Front Barbell Squat To A Bench,expert,Full Gym,Quadriceps), (Front Box Jump,beginner,Full Gym,Hamstrings), (Front Cable Raise,beginner,Full Gym,Shoulders), (Front Cone Hops (or hurdle hops),beginner,Full Gym,Quadriceps), (Front Dumbbell Raise,beginner,Home Gym,Shoulders), (Front Incline Dumbbell Raise,beginner,Home Gym,Shoulders), (Front Leg Raises,beginner,Body Only,Hamstrings), (Front Plate Raise,intermediate,Full Gym,Shoulders), (Front Raise And Pullover,beginner,Full Gym,Chest), (Front Squats With Two Kettlebells,intermediate,Home Gym,Quadriceps), (Front Squat (Clean Grip),intermediate,Full Gym,Quadriceps), (Front Two-Dumbbell Raise,beginner,Home Gym,Shoulders), (Full Range-Of-Motion Lat Pulldown,intermediate,Full Gym,Lats), (Gironda Sternum Chins,intermediate,Full Gym,Lats), (Glute Ham Raise,intermediate,Full Gym,Hamstrings), (Glute Kickback,beginner,Body Only,Glutes), (Goblet Squat,beginner,Home Gym,Quadriceps), (Good Morning,intermediate,Full Gym,Hamstrings), (Good Morning off Pins,intermediate,Full Gym,Hamstrings), (Gorilla Chin/Crunch,intermediate,Body Only,Abdominals), (Groiners,intermediate,Body Only,Adductors), (Groin and Back Stretch,intermediate,Full Gym,Adductors), (Hack Squat,beginner,Full Gym,Quadriceps), (Hammer Curls,beginner,Home Gym,Biceps), (Hammer Grip Incline DB Bench Press,beginner,Home Gym,Chest), (Hamstring-SMR,beginner,Home Gym,Hamstrings), (Hamstring Stretch,beginner,Full Gym,Hamstrings), (Handstand Push-Ups,expert,Body Only,Shoulders), (Hanging Bar Good Morning,intermediate,Full Gym,Hamstrings), (Hanging Leg Raise,expert,Body Only,Abdominals), (Hanging Pike,expert,Body Only,Abdominals), (Hang Clean,intermediate,Full Gym,Quadriceps), (Hang Clean - Below the Knees,intermediate,Full Gym,Quadriceps), (Hang Snatch,expert,Full Gym,Hamstrings), (Hang Snatch - Below Knees,expert,Full Gym,Hamstrings), (Heaving Snatch Balance,intermediate,Full Gym,Quadriceps), (Heavy Bag Thrust,beginner,Full Gym,Chest), (High Cable Curls,intermediate,Full Gym,Biceps), (Hip Circles (prone),beginner,Body Only,Abductors), (Hip Extension with Bands,beginner,Home Gym,Glutes), (Hip Flexion with Band,beginner,Home Gym,Quadriceps), (Hip Lift with Band,beginner,Home Gym,Glutes), (Hug A Ball,beginner,Full Gym,Lower back), (Hug Knees To Chest,beginner,Full Gym,Lower back), (Hurdle Hops,beginner,Full Gym,Hamstrings), (Hyperextensions (Back Extensions),beginner,Full Gym,Lower back), (Hyperextensions With No Hyperextension Bench,intermediate,Body Only,Lower back), (Iliotibial Tract-SMR,intermediate,Home Gym,Abductors), (Inchworm,beginner,Body Only,Hamstrings), (Incline Barbell Triceps Extension,intermediate,Full Gym,Triceps), (Incline Bench Pull,beginner,Full Gym,Middle back), (Incline Cable Chest Press,beginner,Full Gym,Chest), (Incline Cable Flye,intermediate,Full Gym,Chest), (Incline Dumbbell Bench With Palms Facing In,beginner,Home Gym,Chest), (Incline Dumbbell Curl,beginner,Home Gym,Biceps), (Incline Dumbbell Flyes,beginner,Home Gym,Chest), (Incline Dumbbell Flyes - With A Twist,beginner,Home Gym,Chest), (Incline Dumbbell Press,beginner,Home Gym,Chest), (Incline Hammer Curls,beginner,Home Gym,Biceps), (Incline Inner Biceps Curl,beginner,Home Gym,Biceps), (Incline Push-Up,beginner,Body Only,Chest), (Incline Push-Up Close-Grip,beginner,Body Only,Triceps), (Incline Push-Up Depth Jump,beginner,Full Gym,Chest), (Incline Push-Up Medium,beginner,Body Only,Chest), (Incline Push-Up Reverse Grip,beginner,Body Only,Chest), (Incline Push-Up Wide,beginner,Body Only,Chest), (Intermediate Groin Stretch,intermediate,Full Gym,Hamstrings), (Intermediate Hip Flexor and Quad Stretch,intermediate,Full Gym,Quadriceps), (Internal Rotation with Band,beginner,Home Gym,Shoulders), (Inverted Row,beginner,Full Gym,Middle back), (Inverted Row with Straps,beginner,Full Gym,Middle back), (Iron Cross,intermediate,Home Gym,Shoulders), (Iron Crosses (stretch),intermediate,Full Gym,Quadriceps), (Isometric Chest Squeezes,beginner,Body Only,Chest), (Isometric Neck Exercise - Front And Back,beginner,Body Only,Neck), (Isometric Neck Exercise - Sides,beginner,Body Only,Neck), (Isometric Wipers,beginner,Body Only,Chest), (IT Band and Glute Stretch,intermediate,Full Gym,Abductors), (Jackknife Sit-Up,beginner,Body Only,Abdominals), (Janda Sit-Up,beginner,Body Only,Abdominals), (Jefferson Squats,intermediate,Full Gym,Quadriceps), (Jerk Balance,intermediate,Full Gym,Shoulders), (Jerk Dip Squat,intermediate,Full Gym,Quadriceps), (JM Press,beginner,Full Gym,Triceps), (Jogging, Treadmill,beginner,Full Gym,Quadriceps), (Keg Load,intermediate,Full Gym,Lower back), (Kettlebell Arnold Press,intermediate,Home Gym,Shoulders), (Kettlebell Dead Clean,intermediate,Home Gym,Hamstrings), (Kettlebell Figure 8,intermediate,Home Gym,Abdominals), (Kettlebell Hang Clean,intermediate,Home Gym,Hamstrings), (Kettlebell One-Legged Deadlift,intermediate,Home Gym,Hamstrings), (Kettlebell Pass Between The Legs,intermediate,Home Gym,Abdominals), (Kettlebell Pirate Ships,beginner,Home Gym,Shoulders), (Kettlebell Pistol Squat,expert,Home Gym,Quadriceps), (Kettlebell Seated Press,intermediate,Home Gym,Shoulders), (Kettlebell Seesaw Press,intermediate,Home Gym,Shoulders), (Kettlebell Sumo High Pull,intermediate,Home Gym,Traps), (Kettlebell Thruster,intermediate,Home Gym,Shoulders), (Kettlebell Turkish Get-Up (Lunge style),intermediate,Home Gym,Shoulders), (Kettlebell Turkish Get-Up (Squat style),intermediate,Home Gym,Shoulders), (Kettlebell Windmill,intermediate,Home Gym,Abdominals), (Kipping Muscle Up,intermediate,Full Gym,Lats), (Kneeling Arm Drill,beginner,Full Gym,Shoulders), (Kneeling Cable Crunch With Alternating Oblique Twists,beginner,Full Gym,Abdominals), (Kneeling Cable Triceps Extension,intermediate,Full Gym,Triceps), (Kneeling Forearm Stretch,beginner,Full Gym,Forearms), (Kneeling High Pulley Row,beginner,Full Gym,Lats), (Kneeling Hip Flexor,beginner,Full Gym,Quadriceps), (Kneeling Jump Squat,expert,Full Gym,Glutes), (Kneeling Single-Arm High Pulley Row,beginner,Full Gym,Lats), (Kneeling Squat,intermediate,Full Gym,Glutes), (Knee Across The Body,beginner,Full Gym,Glutes), (Knee Circles,beginner,Body Only,Calves), (Knee/Hip Raise On Parallel Bars,beginner,Full Gym,Abdominals), (Knee Tuck Jump,beginner,Body Only,Hamstrings), (Landmine 180's,beginner,Full Gym,Abdominals), (Landmine Linear Jammer,intermediate,Full Gym,Shoulders), (Lateral Bound,beginner,Body Only,Adductors), (Lateral Box Jump,beginner,Full Gym,Adductors), (Lateral Cone Hops,beginner,Full Gym,Adductors), (Lateral Raise - With Bands,beginner,Home Gym,Shoulders), (Latissimus Dorsi-SMR,beginner,Home Gym,Lats), (Leg-Over Floor Press,intermediate,Home Gym,Chest), (Leg-Up Hamstring Stretch,beginner,Full Gym,Hamstrings), (Leg Extensions,beginner,Full Gym,Quadriceps), (Leg Lift,beginner,Body Only,Glutes), (Leg Press,beginner,Full Gym,Quadriceps), (Leg Pull-In,beginner,Body Only,Abdominals), (Leverage Chest Press,beginner,Full Gym,Chest), (Leverage Deadlift,beginner,Full Gym,Quadriceps), (Leverage Decline Chest Press,beginner,Full Gym,Chest), (Leverage High Row,beginner,Full Gym,Middle back), (Leverage Incline Chest Press,beginner,Full Gym,Chest), (Leverage Iso Row,beginner,Full Gym,Lats), (Leverage Shoulder Press,beginner,Full Gym,Shoulders), (Leverage Shrug,beginner,Full Gym,Traps), (Linear 3-Part Start Technique,beginner,Full Gym,Hamstrings), (Linear Acceleration Wall Drill,beginner,Full Gym,Hamstrings), (Linear Depth Jump,intermediate,Full Gym,Quadriceps), (Log Lift,intermediate,Full Gym,Shoulders), (London Bridges,intermediate,Full Gym,Lats), (Looking At Ceiling,beginner,Full Gym,Quadriceps), (Lower Back-SMR,beginner,Home Gym,Lower back), (Lower Back Curl,beginner,Body Only,Abdominals), (Low Cable Crossover,beginner,Full Gym,Chest), (Low Cable Triceps Extension,beginner,Full Gym,Triceps), (Low Pulley Row To Neck,beginner,Full Gym,Shoulders), (Lunge Pass Through,intermediate,Home Gym,Hamstrings), (Lunge Sprint,intermediate,Full Gym,Quadriceps), (Lying Bent Leg Groin,expert,Full Gym,Adductors), (Lying Cable Curl,intermediate,Full Gym,Biceps), (Lying Cambered Barbell Row,beginner,Full Gym,Middle back), (Lying Close-Grip Barbell Triceps Extension Behind The Head,intermediate,Full Gym,Triceps), (Lying Close-Grip Barbell Triceps Press To Chin,intermediate,Full Gym,Triceps), (Lying Close-Grip Bar Curl On High Pulley,beginner,Full Gym,Biceps), (Lying Crossover,expert,Body Only,Abductors), (Lying Dumbbell Tricep Extension,intermediate,Home Gym,Triceps), (Lying Face Down Plate Neck Resistance,intermediate,Full Gym,Neck), (Lying Face Up Plate Neck Resistance,intermediate,Full Gym,Neck), (Lying Glute,expert,Body Only,Glutes), (Lying Hamstring,expert,Full Gym,Hamstrings), (Lying High Bench Barbell Curl,intermediate,Full Gym,Biceps), (Lying Leg Curls,beginner,Full Gym,Hamstrings), (Lying Machine Squat,intermediate,Full Gym,Quadriceps), (Lying One-Arm Lateral Raise,intermediate,Home Gym,Shoulders), (Lying Prone Quadriceps,expert,Body Only,Quadriceps), (Lying Rear Delt Raise,intermediate,Home Gym,Shoulders), (Lying Supine Dumbbell Curl,beginner,Home Gym,Biceps), (Lying T-Bar Row,intermediate,Full Gym,Middle back), (Lying Triceps Press,intermediate,Full Gym,Triceps), (Machine Bench Press,beginner,Full Gym,Chest), (Machine Bicep Curl,beginner,Full Gym,Biceps), (Machine Preacher Curls,beginner,Full Gym,Biceps), (Machine Shoulder (Military) Press,beginner,Full Gym,Shoulders), (Machine Triceps Extension,beginner,Full Gym,Triceps), (Medicine Ball Chest Pass,beginner,Home Gym,Chest), (Medicine Ball Full Twist,beginner,Home Gym,Abdominals), (Medicine Ball Scoop Throw,beginner,Home Gym,Shoulders), (Middle Back Shrug,intermediate,Home Gym,Middle back), (Middle Back Stretch,beginner,Full Gym,Middle back), (Mixed Grip Chin,expert,Full Gym,Middle back), (Monster Walk,beginner,Home Gym,Abductors), (Mountain Climbers,beginner,Full Gym,Quadriceps), (Moving Claw Series,beginner,Full Gym,Hamstrings), (Muscle Snatch,intermediate,Full Gym,Hamstrings), (Muscle Up,intermediate,Full Gym,Lats), (Narrow Stance Hack Squats,intermediate,Full Gym,Quadriceps), (Narrow Stance Leg Press,intermediate,Full Gym,Quadriceps), (Narrow Stance Squats,intermediate,Full Gym,Quadriceps), (Natural Glute Ham Raise,intermediate,Body Only,Hamstrings), (Neck-SMR,intermediate,Full Gym,Neck), (Neck Press,intermediate,Full Gym,Chest), (Oblique Crunches,beginner,Body Only,Abdominals), (Oblique Crunches - On The Floor,beginner,Body Only,Abdominals), (Olympic Squat,intermediate,Full Gym,Quadriceps), (On-Your-Back Quad Stretch,beginner,Full Gym,Quadriceps), (One-Arm Dumbbell Row,beginner,Home Gym,Middle back), (One-Arm Flat Bench Dumbbell Flye,beginner,Home Gym,Chest), (One-Arm High-Pulley Cable Side Bends,beginner,Full Gym,Abdominals), (One-Arm Incline Lateral Raise,beginner,Home Gym,Shoulders), (One-Arm Kettlebell Clean,intermediate,Home Gym,Hamstrings), (One-Arm Kettlebell Clean and Jerk,intermediate,Home Gym,Shoulders), (One-Arm Kettlebell Floor Press,intermediate,Home Gym,Chest), (One-Arm Kettlebell Jerk,intermediate,Home Gym,Shoulders), (One-Arm Kettlebell Military Press To The Side,intermediate,Home Gym,Shoulders), (One-Arm Kettlebell Para Press,intermediate,Home Gym,Shoulders), (One-Arm Kettlebell Push Press,intermediate,Home Gym,Shoulders), (One-Arm Kettlebell Row,intermediate,Home Gym,Middle back), (One-Arm Kettlebell Snatch,expert,Home Gym,Shoulders), (One-Arm Kettlebell Split Jerk,intermediate,Home Gym,Shoulders), (One-Arm Kettlebell Split Snatch,expert,Home Gym,Shoulders), (One-Arm Kettlebell Swings,intermediate,Home Gym,Hamstrings), (One-Arm Long Bar Row,beginner,Full Gym,Middle back), (One-Arm Medicine Ball Slam,beginner,Home Gym,Abdominals), (One-Arm Open Palm Kettlebell Clean,intermediate,Home Gym,Hamstrings), (One-Arm Overhead Kettlebell Squats,expert,Home Gym,Quadriceps), (One-Arm Side Deadlift,expert,Full Gym,Quadriceps), (One-Arm Side Laterals,beginner,Home Gym,Shoulders), (One-Legged Cable Kickback,intermediate,Full Gym,Glutes), (One Arm Against Wall,beginner,Full Gym,Lats), (One Arm Chin-Up,expert,Full Gym,Middle back), (One Arm Dumbbell Bench Press,beginner,Home Gym,Chest), (One Arm Dumbbell Preacher Curl,beginner,Home Gym,Biceps), (One Arm Floor Press,intermediate,Full Gym,Triceps), (One Arm Lat Pulldown,beginner,Full Gym,Lats), (One Arm Pronated Dumbbell Triceps Extension,beginner,Home Gym,Triceps), (One Arm Supinated Dumbbell Triceps Extension,beginner,Home Gym,Triceps), (One Half Locust,beginner,Full Gym,Quadriceps), (One Handed Hang,beginner,Full Gym,Lats), (One Knee To Chest,beginner,Full Gym,Glutes), (One Leg Barbell Squat,expert,Full Gym,Quadriceps), (On Your Side Quad Stretch,beginner,Full Gym,Quadriceps), (Open Palm Kettlebell Clean,expert,Home Gym,Hamstrings), (Otis-Up,beginner,Full Gym,Abdominals), (Overhead Cable Curl,intermediate,Full Gym,Biceps), (Overhead Lat,expert,Full Gym,Lats), (Overhead Slam,beginner,Home Gym,Lats), (Overhead Squat,expert,Full Gym,Quadriceps), (Overhead Stretch,beginner,Full Gym,Abdominals), (Overhead Triceps,expert,Body Only,Triceps), (Pallof Press,beginner,Full Gym,Abdominals), (Pallof Press With Rotation,beginner,Full Gym,Abdominals), (Palms-Down Dumbbell Wrist Curl Over A Bench,beginner,Home Gym,Forearms), (Palms-Down Wrist Curl Over A Bench,beginner,Full Gym,Forearms), (Palms-Up Barbell Wrist Curl Over A Bench,beginner,Full Gym,Forearms), (Palms-Up Dumbbell Wrist Curl Over A Bench,beginner,Home Gym,Forearms), (Parallel Bar Dip,beginner,Full Gym,Triceps), (Pelvic Tilt Into Bridge,intermediate,Full Gym,Lower back), (Peroneals-SMR,intermediate,Home Gym,Calves), (Peroneals Stretch,intermediate,Full Gym,Calves), (Physioball Hip Bridge,beginner,Full Gym,Glutes), (Pin Presses,intermediate,Full Gym,Triceps), (Piriformis-SMR,intermediate,Home Gym,Glutes), (Plank,beginner,Body Only,Abdominals), (Plate Pinch,intermediate,Full Gym,Forearms), (Plate Twist,intermediate,Full Gym,Abdominals), (Platform Hamstring Slides,beginner,Full Gym,Hamstrings), (Plie Dumbbell Squat,beginner,Home Gym,Quadriceps), (Plyo Kettlebell Pushups,expert,Home Gym,Chest), (Plyo Push-up,beginner,Body Only,Chest), (Posterior Tibialis Stretch,intermediate,Full Gym,Calves), (Power Clean,intermediate,Full Gym,Hamstrings), (Power Clean from Blocks,intermediate,Full Gym,Hamstrings), (Power Jerk,expert,Full Gym,Quadriceps), (Power Partials,beginner,Home Gym,Shoulders), (Power Snatch,expert,Full Gym,Hamstrings), (Power Snatch from Blocks,intermediate,Full Gym,Quadriceps), (Power Stairs,intermediate,Full Gym,Hamstrings), (Preacher Curl,beginner,Full Gym,Biceps), (Preacher Hammer Dumbbell Curl,beginner,Home Gym,Biceps), (Press Sit-Up,expert,Full Gym,Abdominals), (Prone Manual Hamstring,beginner,Full Gym,Hamstrings), (Prowler Sprint,beginner,Full Gym,Hamstrings), (Pullups,beginner,Body Only,Lats), (Pull Through,beginner,Full Gym,Glutes), (Push-Ups - Close Triceps Position,intermediate,Body Only,Triceps), (Push-Ups With Feet Elevated,beginner,Body Only,Chest), (Push-Ups With Feet On An Exercise Ball,intermediate,Full Gym,Chest), (Push-Up Wide,beginner,Body Only,Chest), (Pushups,beginner,Body Only,Chest), (Pushups (Close and Wide Hand Positions),beginner,Body Only,Chest), (Push Press,expert,Full Gym,Shoulders), (Push Press - Behind the Neck,intermediate,Full Gym,Shoulders), (Push Up to Side Plank,beginner,Body Only,Chest), (Pyramid,beginner,Full Gym,Lower back), (Quadriceps-SMR,intermediate,Home Gym,Quadriceps), (Quad Stretch,intermediate,Full Gym,Quadriceps), (Quick Leap,beginner,Full Gym,Quadriceps), (Rack Delivery,intermediate,Full Gym,Shoulders), (Rack Pulls,intermediate,Full Gym,Lower back), (Rack Pull with Bands,intermediate,Full Gym,Lower back), (Rear Leg Raises,beginner,Body Only,Quadriceps), (Recumbent Bike,beginner,Full Gym,Quadriceps), (Return Push from Stance,beginner,Home Gym,Shoulders), (Reverse Band Bench Press,intermediate,Full Gym,Triceps), (Reverse Band Box Squat,intermediate,Full Gym,Quadriceps), (Reverse Band Deadlift,expert,Full Gym,Lower back), (Reverse Band Power Squat,expert,Full Gym,Quadriceps), (Reverse Band Sumo Deadlift,expert,Full Gym,Hamstrings), (Reverse Barbell Curl,beginner,Full Gym,Biceps), (Reverse Barbell Preacher Curls,intermediate,Full Gym,Biceps), (Reverse Cable Curl,beginner,Full Gym,Biceps), (Reverse Crunch,beginner,Body Only,Abdominals), (Reverse Flyes,beginner,Home Gym,Shoulders), (Reverse Flyes With External Rotation,intermediate,Home Gym,Shoulders), (Reverse Grip Bent-Over Rows,intermediate,Full Gym,Middle back), (Reverse Grip Triceps Pushdown,beginner,Full Gym,Triceps), (Reverse Hyperextension,intermediate,Full Gym,Hamstrings), (Reverse Machine Flyes,beginner,Full Gym,Shoulders), (Reverse Plate Curls,beginner,Full Gym,Biceps), (Reverse Triceps Bench Press,intermediate,Full Gym,Triceps), (Rhomboids-SMR,intermediate,Home Gym,Middle back), (Rickshaw Carry,intermediate,Full Gym,Forearms), (Rickshaw Deadlift,intermediate,Full Gym,Quadriceps), (Ring Dips,intermediate,Full Gym,Triceps), (Rocket Jump,beginner,Body Only,Quadriceps), (Rocking Standing Calf Raise,beginner,Full Gym,Calves), (Rocky Pull-Ups/Pulldowns,intermediate,Full Gym,Lats), (Romanian Deadlift,intermediate,Full Gym,Hamstrings), (Romanian Deadlift from Deficit,intermediate,Full Gym,Hamstrings), (Rope Climb,intermediate,Full Gym,Lats), (Rope Crunch,beginner,Full Gym,Abdominals), (Rope Jumping,intermediate,Full Gym,Quadriceps), (Rope Straight-Arm Pulldown,beginner,Full Gym,Lats), (Round The World Shoulder Stretch,beginner,Full Gym,Shoulders), (Rowing, Stationary,intermediate,Full Gym,Quadriceps), (Runner's Stretch,beginner,Full Gym,Hamstrings), (Running, Treadmill,beginner,Full Gym,Quadriceps), (Russian Twist,intermediate,Body Only,Abdominals), (Sandbag Load,beginner,Full Gym,Quadriceps), (Scapular Pull-Up,beginner,Full Gym,Traps), (Scissors Jump,beginner,Body Only,Quadriceps), (Scissor Kick,beginner,Body Only,Abdominals), (Seated Band Hamstring Curl,beginner,Full Gym,Hamstrings), (Seated Barbell Military Press,intermediate,Full Gym,Shoulders), (Seated Barbell Twist,beginner,Full Gym,Abdominals), (Seated Bent-Over One-Arm Dumbbell Triceps Extension,beginner,Home Gym,Triceps), (Seated Bent-Over Rear Delt Raise,intermediate,Home Gym,Shoulders), (Seated Bent-Over Two-Arm Dumbbell Triceps Extension,intermediate,Home Gym,Triceps), (Seated Biceps,expert,Body Only,Biceps), (Seated Cable Rows,beginner,Full Gym,Middle back), (Seated Cable Shoulder Press,beginner,Full Gym,Shoulders), (Seated Calf Raise,beginner,Full Gym,Calves), (Seated Calf Stretch,beginner,Full Gym,Calves), (Seated Close-Grip Concentration Barbell Curl,intermediate,Full Gym,Biceps), (Seated Dumbbell Curl,beginner,Home Gym,Biceps), (Seated Dumbbell Inner Biceps Curl,beginner,Home Gym,Biceps), (Seated Dumbbell Palms-Down Wrist Curl,beginner,Home Gym,Forearms), (Seated Dumbbell Palms-Up Wrist Curl,beginner,Home Gym,Forearms), (Seated Dumbbell Press,beginner,Home Gym,Shoulders), (Seated Flat Bench Leg Pull-In,beginner,Body Only,Abdominals), (Seated Floor Hamstring Stretch,beginner,Full Gym,Hamstrings), (Seated Front Deltoid,expert,Body Only,Shoulders), (Seated Glute,expert,Body Only,Glutes), (Seated Good Mornings,intermediate,Full Gym,Lower back), (Seated Hamstring,expert,Full Gym,Hamstrings), (Seated Hamstring and Calf Stretch,intermediate,Full Gym,Hamstrings), (Seated Head Harness Neck Resistance,intermediate,Full Gym,Neck), (Seated Leg Curl,beginner,Full Gym,Hamstrings), (Seated Leg Tucks,beginner,Body Only,Abdominals), (Seated One-arm Cable Pulley Rows,intermediate,Full Gym,Middle back), (Seated One-Arm Dumbbell Palms-Down Wrist Curl,intermediate,Home Gym,Forearms), (Seated One-Arm Dumbbell Palms-Up Wrist Curl,beginner,Home Gym,Forearms), (Seated Overhead Stretch,beginner,Full Gym,Abdominals), (Seated Palm-Up Barbell Wrist Curl,beginner,Full Gym,Forearms), (Seated Palms-Down Barbell Wrist Curl,beginner,Full Gym,Forearms), (Seated Side Lateral Raise,beginner,Home Gym,Shoulders), (Seated Triceps Press,beginner,Home Gym,Triceps), (Seated Two-Arm Palms-Up Low-Pulley Wrist Curl,beginner,Full Gym,Forearms), (See-Saw Press (Alternating Side Press),intermediate,Home Gym,Shoulders), (Shotgun Row,beginner,Full Gym,Lats), (Shoulder Circles,beginner,Full Gym,Shoulders), (Shoulder Press - With Bands,beginner,Home Gym,Shoulders), (Shoulder Raise,beginner,Full Gym,Shoulders), (Shoulder Stretch,beginner,Full Gym,Shoulders), (Side-Lying Floor Stretch,beginner,Full Gym,Lats), (Side Bridge,beginner,Body Only,Abdominals), (Side Hop-Sprint,beginner,Full Gym,Quadriceps), (Side Jackknife,beginner,Body Only,Abdominals), (Side Laterals to Front Raise,beginner,Home Gym,Shoulders), (Side Lateral Raise,beginner,Home Gym,Shoulders), (Side Leg Raises,beginner,Body Only,Adductors), (Side Lying Groin Stretch,beginner,Full Gym,Adductors), (Side Neck Stretch,beginner,Full Gym,Neck), (Side Standing Long Jump,beginner,Full Gym,Quadriceps), (Side to Side Box Shuffle,beginner,Full Gym,Quadriceps), (Side To Side Chins,intermediate,Full Gym,Lats), (Side Wrist Pull,beginner,Full Gym,Shoulders), (Single-Arm Cable Crossover,beginner,Full Gym,Chest), (Single-Arm Linear Jammer,intermediate,Full Gym,Shoulders), (Single-Arm Push-Up,intermediate,Body Only,Chest), (Single-Cone Sprint Drill,beginner,Full Gym,Quadriceps), (Single-Leg High Box Squat,beginner,Full Gym,Quadriceps), (Single-Leg Hop Progression,beginner,Full Gym,Quadriceps), (Single-Leg Lateral Hop,beginner,Full Gym,Quadriceps), (Single-Leg Leg Extension,beginner,Full Gym,Quadriceps), (Single-Leg Stride Jump,beginner,Full Gym,Quadriceps), (Single Dumbbell Raise,beginner,Home Gym,Shoulders), (Single Leg Butt Kick,beginner,Body Only,Quadriceps), (Single Leg Glute Bridge,beginner,Body Only,Glutes), (Single Leg Push-off,beginner,Full Gym,Quadriceps), (Sit-Up,beginner,Body Only,Abdominals), (Sit Squats,beginner,Full Gym,Quadriceps), (Skating,intermediate,Full Gym,Quadriceps), (Sledgehammer Swings,beginner,Full Gym,Abdominals), (Sled Drag - Harness,beginner,Full Gym,Quadriceps), (Sled Overhead Backward Walk,beginner,Full Gym,Shoulders), (Sled Overhead Triceps Extension,beginner,Full Gym,Triceps), (Sled Push,beginner,Full Gym,Quadriceps), (Sled Reverse Flye,beginner,Full Gym,Shoulders), (Sled Row,beginner,Full Gym,Middle back), (Smith Incline Shoulder Raise,beginner,Full Gym,Shoulders), (Smith Machine Behind the Back Shrug,beginner,Full Gym,Traps), (Smith Machine Bench Press,beginner,Full Gym,Chest), (Smith Machine Bent Over Row,beginner,Full Gym,Middle back), (Smith Machine Calf Raise,beginner,Full Gym,Calves), (Smith Machine Close-Grip Bench Press,beginner,Full Gym,Triceps), (Smith Machine Decline Press,beginner,Full Gym,Chest), (Smith Machine Hang Power Clean,intermediate,Full Gym,Hamstrings), (Smith Machine Hip Raise,beginner,Full Gym,Abdominals), (Smith Machine Incline Bench Press,beginner,Full Gym,Chest), (Smith Machine Leg Press,intermediate,Full Gym,Quadriceps), (Smith Machine One-Arm Upright Row,beginner,Full Gym,Shoulders), (Smith Machine Overhead Shoulder Press,beginner,Full Gym,Shoulders), (Smith Machine Pistol Squat,intermediate,Full Gym,Quadriceps), (Smith Machine Reverse Calf Raises,beginner,Full Gym,Calves), (Smith Machine Squat,beginner,Full Gym,Quadriceps), (Smith Machine Stiff-Legged Deadlift,beginner,Full Gym,Hamstrings), (Smith Machine Upright Row,beginner,Full Gym,Traps), (Smith Single-Leg Split Squat,beginner,Full Gym,Quadriceps), (Snatch,intermediate,Full Gym,Quadriceps), (Snatch Balance,intermediate,Full Gym,Quadriceps), (Snatch Deadlift,intermediate,Full Gym,Hamstrings), (Snatch from Blocks,expert,Full Gym,Quadriceps), (Snatch Pull,intermediate,Full Gym,Hamstrings), (Snatch Shrug,intermediate,Full Gym,Traps), (Speed Band Overhead Triceps,beginner,Home Gym,Triceps), (Speed Box Squat,intermediate,Full Gym,Quadriceps), (Speed Squats,expert,Full Gym,Quadriceps), (Spell Caster,beginner,Home Gym,Abdominals), (Spider Crawl,beginner,Body Only,Abdominals), (Spider Curl,beginner,Full Gym,Biceps), (Spinal Stretch,beginner,Full Gym,Middle back), (Split Clean,intermediate,Full Gym,Quadriceps), (Split Jerk,intermediate,Full Gym,Quadriceps), (Split Jump,beginner,Body Only,Quadriceps), (Split Snatch,expert,Full Gym,Hamstrings), (Split Squats,intermediate,Full Gym,Hamstrings), (Split Squat with Dumbbells,beginner,Home Gym,Quadriceps), (Squats - With Bands,beginner,Home Gym,Quadriceps), (Squat Jerk,expert,Full Gym,Quadriceps), (Squat with Bands,intermediate,Full Gym,Quadriceps), (Squat with Chains,intermediate,Full Gym,Quadriceps), (Squat with Plate Movers,intermediate,Full Gym,Quadriceps), (Stairmaster,intermediate,Full Gym,Quadriceps), (Standing Alternating Dumbbell Press,beginner,Home Gym,Shoulders), (Standing Barbell Calf Raise,beginner,Full Gym,Calves), (Standing Barbell Press Behind Neck,intermediate,Full Gym,Shoulders), (Standing Bent-Over One-Arm Dumbbell Triceps Extension,beginner,Home Gym,Triceps), (Standing Bent-Over Two-Arm Dumbbell Triceps Extension,beginner,Home Gym,Triceps), (Standing Biceps Cable Curl,beginner,Full Gym,Biceps), (Standing Biceps Stretch,beginner,Full Gym,Biceps), (Standing Bradford Press,beginner,Full Gym,Shoulders), (Standing Cable Chest Press,beginner,Full Gym,Chest), (Standing Cable Lift,beginner,Full Gym,Abdominals), (Standing Cable Wood Chop,beginner,Full Gym,Abdominals), (Standing Calf Raises,beginner,Full Gym,Calves), (Standing Concentration Curl,beginner,Home Gym,Biceps), (Standing Dumbbell Calf Raise,intermediate,Home Gym,Calves), (Standing Dumbbell Press,beginner,Home Gym,Shoulders), (Standing Dumbbell Reverse Curl,intermediate,Home Gym,Biceps), (Standing Dumbbell Straight-Arm Front Delt Raise Above Head,intermediate,Home Gym,Shoulders), (Standing Dumbbell Triceps Extension,beginner,Home Gym,Triceps), (Standing Dumbbell Upright Row,beginner,Home Gym,Traps), (Standing Elevated Quad Stretch,beginner,Full Gym,Quadriceps), (Standing Front Barbell Raise Over Head,intermediate,Full Gym,Shoulders), (Standing Gastrocnemius Calf Stretch,beginner,Full Gym,Calves), (Standing Hamstring and Calf Stretch,beginner,Full Gym,Hamstrings), (Standing Hip Circles,beginner,Body Only,Abductors), (Standing Hip Flexors,beginner,Full Gym,Quadriceps), (Standing Inner-Biceps Curl,intermediate,Home Gym,Biceps), (Standing Lateral Stretch,beginner,Full Gym,Abdominals), (Standing Leg Curl,beginner,Full Gym,Hamstrings), (Standing Long Jump,beginner,Body Only,Quadriceps), (Standing Low-Pulley Deltoid Raise,beginner,Full Gym,Shoulders), (Standing Low-Pulley One-Arm Triceps Extension,intermediate,Full Gym,Triceps), (Standing Military Press,beginner,Full Gym,Shoulders), (Standing Olympic Plate Hand Squeeze,beginner,Full Gym,Forearms), (Standing One-Arm Cable Curl,intermediate,Full Gym,Biceps), (Standing One-Arm Dumbbell Curl Over Incline Bench,beginner,Home Gym,Biceps), (Standing One-Arm Dumbbell Triceps Extension,beginner,Home Gym,Triceps), (Standing Overhead Barbell Triceps Extension,beginner,Full Gym,Triceps), (Standing Palm-In One-Arm Dumbbell Press,beginner,Home Gym,Shoulders), (Standing Palms-In Dumbbell Press,intermediate,Home Gym,Shoulders), (Standing Palms-Up Barbell Behind The Back Wrist Curl,beginner,Full Gym,Forearms), (Standing Pelvic Tilt,beginner,Full Gym,Lower back), (Standing Rope Crunch,beginner,Full Gym,Abdominals), (Standing Soleus And Achilles Stretch,beginner,Full Gym,Calves), (Standing Toe Touches,beginner,Full Gym,Hamstrings), (Standing Towel Triceps Extension,beginner,Body Only,Triceps), (Standing Two-Arm Overhead Throw,beginner,Home Gym,Shoulders), (Star Jump,beginner,Body Only,Quadriceps), (Step-up with Knee Raise,beginner,Body Only,Glutes), (Step Mill,intermediate,Full Gym,Quadriceps), (Stiff-Legged Barbell Deadlift,intermediate,Full Gym,Hamstrings), (Stiff-Legged Dumbbell Deadlift,beginner,Home Gym,Hamstrings), (Stiff Leg Barbell Good Morning,beginner,Full Gym,Lower back), (Stomach Vacuum,beginner,Body Only,Abdominals), (Straight-Arm Dumbbell Pullover,intermediate,Home Gym,Chest), (Straight-Arm Pulldown,beginner,Full Gym,Lats), (Straight Bar Bench Mid Rows,beginner,Full Gym,Middle back), (Straight Raises on Incline Bench,beginner,Full Gym,Shoulders), (Stride Jump Crossover,beginner,Full Gym,Quadriceps), (Sumo Deadlift,intermediate,Full Gym,Hamstrings), (Sumo Deadlift with Bands,intermediate,Full Gym,Hamstrings), (Sumo Deadlift with Chains,intermediate,Full Gym,Hamstrings), (Superman,beginner,Body Only,Lower back), (Supine Chest Throw,beginner,Home Gym,Triceps), (Supine One-Arm Overhead Throw,beginner,Home Gym,Abdominals), (Supine Two-Arm Overhead Throw,beginner,Home Gym,Abdominals), (Suspended Fallout,intermediate,Full Gym,Abdominals), (Suspended Push-Up,beginner,Full Gym,Chest), (Suspended Reverse Crunch,beginner,Full Gym,Abdominals), (Suspended Row,beginner,Full Gym,Middle back), (Suspended Split Squat,intermediate,Full Gym,Quadriceps), (Svend Press,beginner,Full Gym,Chest), (T-Bar Row with Handle,beginner,Full Gym,Middle back), (Tate Press,intermediate,Home Gym,Triceps), (The Straddle,beginner,Full Gym,Hamstrings), (Thigh Abductor,beginner,Full Gym,Abductors), (Thigh Adductor,beginner,Full Gym,Adductors), (Tire Flip,intermediate,Full Gym,Quadriceps), (Toe Touchers,beginner,Body Only,Abdominals), (Torso Rotation,beginner,Full Gym,Abdominals), (Trail Running/Walking,beginner,Full Gym,Quadriceps), (Trap Bar Deadlift,beginner,Full Gym,Quadriceps), (Triceps Overhead Extension with Rope,beginner,Full Gym,Triceps), (Triceps Pushdown,beginner,Full Gym,Triceps), (Triceps Pushdown - Rope Attachment,beginner,Full Gym,Triceps), (Triceps Pushdown - V-Bar Attachment,beginner,Full Gym,Triceps), (Triceps Stretch,beginner,Full Gym,Triceps), (Tricep Dumbbell Kickback,beginner,Home Gym,Triceps), (Tricep Side Stretch,beginner,Full Gym,Triceps), (Tuck Crunch,beginner,Body Only,Abdominals), (Two-Arm Dumbbell Preacher Curl,beginner,Home Gym,Biceps), (Two-Arm Kettlebell Clean,intermediate,Home Gym,Shoulders), (Two-Arm Kettlebell Jerk,intermediate,Home Gym,Shoulders), (Two-Arm Kettlebell Military Press,intermediate,Home Gym,Shoulders), (Two-Arm Kettlebell Row,intermediate,Home Gym,Middle back), (Underhand Cable Pulldowns,beginner,Full Gym,Lats), (Upper Back-Leg Grab,beginner,Full Gym,Hamstrings), (Upper Back Stretch,beginner,Full Gym,Middle back), (Upright Barbell Row,beginner,Full Gym,Shoulders), (Upright Cable Row,intermediate,Full Gym,Traps), (Upright Row - With Bands,beginner,Home Gym,Traps), (Upward Stretch,beginner,Full Gym,Shoulders), (V-Bar Pulldown,intermediate,Full Gym,Lats), (V-Bar Pullup,beginner,Body Only,Lats), (Vertical Swing,beginner,Home Gym,Hamstrings), (Walking, Treadmill,beginner,Full Gym,Quadriceps), (Weighted Ball Hyperextension,intermediate,Full Gym,Lower back), (Weighted Ball Side Bend,intermediate,Full Gym,Abdominals), (Weighted Bench Dip,intermediate,Full Gym,Triceps), (Weighted Crunches,beginner,Home Gym,Abdominals), (Weighted Jump Squat,intermediate,Full Gym,Quadriceps), (Weighted Pull Ups,intermediate,Full Gym,Lats), (Weighted Sissy Squat,expert,Full Gym,Quadriceps), (Weighted Sit-Ups - With Bands,intermediate,Full Gym,Abdominals), (Weighted Squat,intermediate,Full Gym,Quadriceps), (Wide-Grip Barbell Bench Press,intermediate,Full Gym,Chest), (Wide-Grip Decline Barbell Bench Press,intermediate,Full Gym,Chest), (Wide-Grip Decline Barbell Pullover,intermediate,Full Gym,Chest), (Wide-Grip Lat Pulldown,beginner,Full Gym,Lats), (Wide-Grip Pulldown Behind The Neck,intermediate,Full Gym,Lats), (Wide-Grip Rear Pull-Up,intermediate,Body Only,Lats), (Wide-Grip Standing Barbell Curl,beginner,Full Gym,Biceps), (Wide Stance Barbell Squat,intermediate,Full Gym,Quadriceps), (Wide Stance Stiff Legs,intermediate,Full Gym,Hamstrings), (Windmills,intermediate,Full Gym,Abductors), (Wind Sprints,beginner,Body Only,Abdominals), (World's Greatest Stretch,intermediate,Full Gym,Hamstrings), (Wrist Circles,beginner,Body Only,Forearms), (Wrist Roller,beginner,Full Gym,Forearms), (Wrist Rotations with Straight Bar,beginner,Full Gym,Forearms), (Yoke Walk,intermediate,Full Gym,Quadriceps), (Zercher Squats,expert,Full Gym,Quadriceps), (Zottman Curl,intermediate,Home Gym,Biceps), (Zottman Preacher Curl,intermediate,Home Gym,Biceps)`;

  let exercisesArray = exercisesList.split('), ');

  function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
      }
  }

  shuffleArray(exercisesArray);

  // Join the array back into a string
  const randomizedExercisesList = exercisesArray.join('), ') + ')';

  const messages = [
    {
      role: 'system',
      content: `You are an exercise and workout coach. If the user's fitness level is beginner, only choose exercises in their list that are beginner. If the user's fitness level is intermediate, only choose exercises in their list that are beginner or intermediate. If the user's fitness level is expert, you can choose beginner, intermediate, or expert exercises. If the user's gym type is Body Only, only choose body only exercises. If the user's gym type is Home Gym, then only choose body only or home gym exercises. If the user's gym type is Full Gym, then you can choose body only, home gym, or full gym exercises. Based on all of this, this is your only job: based on the user's goal, list 20 exercise names from their exercise list that you think would help them reach their goal (the only text you will respond with is the exercise names, don't number them).`,
    },
    {
      role: 'user',
      content: `My fitness goal is: ${input}. My fitness level is ${userBaselineTest.fitnessLevel} level. My gym type is ${userBaselineTest.selectedEquipmentCategory}. Here is the list of exercises to choose from in the (exercise name, fitness level, gym type) format: ${randomizedExercisesList}`,
    },
  ];

  const response = await axios.post(
    endpoint,
    { model: modelIdentifier, messages },
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );

  return response.data.choices[0].message.content;
};

const storage = getStorage();

const fetchExerciseImages = async (exerciseName) => {
  const sanitizedExerciseName = exerciseName.replace(/\s+/g, '_').replace(/'/g, '');

  // Assuming your images are stored as 'exerciseName_0.jpg' and 'exerciseName_1.jpg'
  const imageUrls = await Promise.all(
    [0, 1].map(async (index) => {
      const imageRef = ref(storage, `exercise_images/${sanitizedExerciseName}_${index}.jpg`);
      return getDownloadURL(imageRef).catch(() => null); // Return null if image not found
    })
  );

  return imageUrls.filter(url => url !== null); // Filter out any null URLs
};

const getExerciseInstructions = (exerciseName) => {
  
};

const submitWorkoutToFirebase = async (workoutName, workoutExercises) => {
  try {
    const docRef = await addDoc(collection(db, "workouts"), {
      name: workoutName,
      exercises: workoutExercises,
      userId: auth.currentUser.uid, // Assuming you want to associate the workout with the current user
      createdAt: new Date() // Optional: store the creation date of the workout
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

const ChatScreen = () => {
  const [input, setInput] = useState('');
  const [userBaselineTest, setUserBaselineTest] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [workoutName, setWorkoutName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  useEffect(() => {
    if (auth.currentUser) {
      fetchBaselineTestData(auth.currentUser.uid).then((data) => {
        setUserBaselineTest(data);
      });
    }
  }, []);

  const handleUserInput = async () => {
    if (!userBaselineTest) {
      console.log('Baseline test data not available.');
      return;
    }
    const exerciseResponse = await callOpenAI(input, userBaselineTest);
    const extractedExercises = exerciseResponse.split('\n').map(ex => ex.trim());
    const newWorkoutPlan = extractedExercises.map(exercise => ({
      name: exercise,
      selected: false,
      expanded: false,
      images: [], 
      instructions: '' 
    }));
    setWorkoutPlan(newWorkoutPlan);
    setInput('');
  };

  const handleCheckboxChange = (exerciseName) => {
    const newWorkoutPlan = workoutPlan.map(exercise => {
      if (exercise.name === exerciseName) {
        return { ...exercise, selected: !exercise.selected };
      }
      return exercise;
    });
    setWorkoutPlan(newWorkoutPlan);
  };

  const handleSubmitWorkout = async () => {
    const selectedExercises = workoutPlan.filter(exercise => exercise.selected).map(exercise => exercise.name);
    if (selectedExercises.length === 0 || workoutName.trim() === '') {
      alert('Please select exercises and provide a name for the workout.');
      return;
    }
    await submitWorkoutToFirebase(workoutName, selectedExercises);
    setIsSubmitted(true);
  };

  const toggleExerciseSelection = async (exerciseName) => {
    const newWorkoutPlan = await Promise.all(workoutPlan.map(async (exercise) => {
      if (exercise.name === exerciseName) {
        const isExpanded = !exercise.expanded;
        let images = exercise.images, instructions = exercise.instructions;
        if (isExpanded && !images.length) {
          // Fetch images and instructions only if not already fetched
          images = await fetchExerciseImages(exerciseName);
          instructions = getExerciseInstructions(exerciseName);
        }
        return { ...exercise, expanded: isExpanded, images, instructions };
      }
      return { ...exercise, expanded: false }; // Collapse other exercises
    }));
    setWorkoutPlan(newWorkoutPlan);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          value={workoutName}
          onChangeText={setWorkoutName}
          placeholder="Enter Workout Name"
          style={styles.input}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="What's your fitness goal?"
          style={styles.input}
        />
        <Button title="Get Exercises" onPress={handleUserInput} color="#007AFF" />
      </View>

      <ScrollView style={styles.scrollView}>
        {workoutPlan.map((exercise, index) => (
          <View key={index}>
            <View style={styles.exerciseItem}>
              <Checkbox
                value={exercise.selected}
                onValueChange={() => handleCheckboxChange(exercise.name)}
                color={exercise.selected ? "#007AFF" : undefined}
              />
              <TouchableOpacity onPress={() => toggleExerciseSelection(exercise.name)}>
                <Text style={styles.exerciseText}>{exercise.name}</Text>
              </TouchableOpacity>
            </View>
            {exercise.expanded && (
              <View style={styles.selectedExercise}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {exercise.images.map((image, imgIndex) => (
                    <Image key={imgIndex} source={{ uri: image }} style={styles.exerciseImage} />
                  ))}
                </ScrollView>
                <Text style={styles.exerciseInstructions}>{exercise.instructions}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.submitContainer}>
        <Button
          title="Submit Workout"
          onPress={handleSubmitWorkout}
          color="#007AFF"
          disabled={isSubmitted}
        />
        {isSubmitted && <Text style={styles.submissionStatus}>Workout submitted successfully!</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6', // Light grey background
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginRight: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF', // White background for input
  },
  scrollView: {
    flex: 1,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#FFFFFF', // White background for list items
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,  
    elevation: 3,
  },
  exerciseText: {
    marginLeft: 8,
    color: '#333333', // Dark text for better readability
  },
  selectedExercise: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,  
    elevation: 3,
  },
  exerciseName: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  exerciseImage: {
    width: 100,
    height: 100,
    marginRight: 8,
    borderRadius: 5, // Rounded corners for images
  },
  exerciseInstructions: {
    marginTop: 8,
  },
  submitContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  submissionStatus: {
    marginTop: 10,
    color: 'green',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ChatScreen;