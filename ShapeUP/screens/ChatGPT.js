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

  const exercisesList = `(3/4 Sit-Up,beginner,Body Only), (90/90 Hamstring,beginner,Body Only), (Ab Crunch Machine,intermediate,Full Gym), (Ab Roller,intermediate,Full Gym), (Adductor,intermediate,Home Gym), (Adductor/Groin,intermediate,Full Gym), (Advanced Kettlebell Windmill,intermediate,Home Gym), (Air Bike,beginner,Body Only), (All Fours Quad Stretch,intermediate,Body Only), (Alternate Hammer Curl,beginner,Home Gym), (Alternate Heel Touchers,beginner,Body Only), (Alternate Incline Dumbbell Curl,beginner,Home Gym), (Alternate Leg Diagonal Bound,beginner,Full Gym), (Alternating Cable Shoulder Press,beginner,Full Gym), (Alternating Deltoid Raise,beginner,Home Gym), (Alternating Floor Press,beginner,Home Gym), (Alternating Hang Clean,intermediate,Home Gym), (Alternating Kettlebell Press,intermediate,Home Gym), (Alternating Kettlebell Row,intermediate,Home Gym), (Alternating Renegade Row,expert,Home Gym), (Ankle Circles,beginner,Full Gym), (Ankle On The Knee,beginner,Full Gym), (Anterior Tibialis-SMR,intermediate,Full Gym), (Anti-Gravity Press,beginner,Full Gym), (Arm Circles,beginner,Full Gym), (Arnold Dumbbell Press,intermediate,Home Gym), (Around The Worlds,intermediate,Home Gym), (Atlas Stones,expert,Full Gym), (Atlas Stone Trainer,intermediate,Full Gym), (Axle Deadlift,intermediate,Full Gym), (Backward Drag,beginner,Full Gym), (Backward Medicine Ball Throw,beginner,Home Gym), (Back Flyes - With Bands,beginner,Home Gym), (Balance Board,beginner,Full Gym), (Ball Leg Curl,beginner,Full Gym), (Band Assisted Pull-Up,beginner,Full Gym), (Band Good Morning,beginner,Home Gym), (Band Good Morning (Pull Through),beginner,Home Gym), (Band Hip Adductions,beginner,Home Gym), (Band Pull Apart,beginner,Home Gym), (Band Skull Crusher,beginner,Home Gym), (Barbell Ab Rollout,intermediate,Full Gym), (Barbell Ab Rollout - On Knees,expert,Full Gym), (Barbell Bench Press - Medium Grip,beginner,Full Gym), (Barbell Curl,beginner,Full Gym), (Barbell Curls Lying Against An Incline,beginner,Full Gym), (Barbell Deadlift,intermediate,Full Gym), (Barbell Full Squat,intermediate,Full Gym), (Barbell Glute Bridge,intermediate,Full Gym), (Barbell Guillotine Bench Press,intermediate,Full Gym), (Barbell Hack Squat,intermediate,Full Gym), (Barbell Hip Thrust,intermediate,Full Gym), (Barbell Incline Bench Press - Medium Grip,beginner,Full Gym), (Barbell Incline Shoulder Raise,beginner,Full Gym), (Barbell Lunge,intermediate,Full Gym), (Barbell Rear Delt Row,beginner,Full Gym), (Barbell Rollout from Bench,intermediate,Full Gym), (Barbell Seated Calf Raise,beginner,Full Gym), (Barbell Shoulder Press,intermediate,Full Gym), (Barbell Shrug,beginner,Full Gym), (Barbell Shrug Behind The Back,beginner,Full Gym), (Barbell Side Bend,beginner,Full Gym), (Barbell Side Split Squat,beginner,Full Gym), (Barbell Squat,beginner,Full Gym), (Barbell Squat To A Bench,expert,Full Gym), (Barbell Step Ups,intermediate,Full Gym), (Barbell Walking Lunge,beginner,Full Gym), (Battling Ropes,beginner,Full Gym), (Bear Crawl Sled Drags,beginner,Full Gym), (Behind Head Chest Stretch,expert,Full Gym), (Bench Dips,beginner,Body Only), (Bench Jump,intermediate,Body Only), (Bench Press - Powerlifting,intermediate,Full Gym), (Bench Press - With Bands,beginner,Home Gym), (Bench Press with Chains,expert,Full Gym), (Bench Sprint,beginner,Full Gym), (Bent-Arm Barbell Pullover,intermediate,Full Gym), (Bent-Arm Dumbbell Pullover,intermediate,Home Gym), (Bent-Knee Hip Raise,beginner,Body Only), (Bent Over Barbell Row,beginner,Full Gym), (Bent Over Dumbbell Rear Delt Raise With Head On Bench,beginner,Home Gym), (Bent Over Low-Pulley Side Lateral,beginner,Full Gym), (Bent Over One-Arm Long Bar Row,beginner,Full Gym), (Bent Over Two-Arm Long Bar Row,intermediate,Full Gym), (Bent Over Two-Dumbbell Row,beginner,Home Gym), (Bent Over Two-Dumbbell Row With Palms In,beginner,Home Gym), (Bent Press,expert,Home Gym), (Bicycling,beginner,Full Gym), (Bicycling, Stationary,beginner,Full Gym), (Board Press,intermediate,Full Gym), (Body-Up,intermediate,Body Only), (Bodyweight Flyes,intermediate,Full Gym), (Bodyweight Mid Row,intermediate,Full Gym), (Bodyweight Squat,beginner,Body Only), (Bodyweight Walking Lunge,beginner,Full Gym), (Body Tricep Press,beginner,Body Only), (Bosu Ball Cable Crunch With Side Bends,beginner,Full Gym), (Bottoms-Up Clean From The Hang Position,intermediate,Home Gym), (Bottoms Up,beginner,Body Only), (Box Jump (Multiple Response),beginner,Full Gym), (Box Skip,beginner,Full Gym), (Box Squat,intermediate,Full Gym), (Box Squat with Bands,expert,Full Gym), (Box Squat with Chains,expert,Full Gym), (Brachialis-SMR,intermediate,Home Gym), (Bradford/Rocky Presses,beginner,Full Gym), (Butt-Ups,beginner,Body Only), (Butterfly,beginner,Full Gym), (Butt Lift (Bridge),beginner,Body Only), (Cable Chest Press,beginner,Full Gym), (Cable Crossover,beginner,Full Gym), (Cable Crunch,beginner,Full Gym), (Cable Deadlifts,beginner,Full Gym), (Cable Hammer Curls - Rope Attachment,beginner,Full Gym), (Cable Hip Adduction,beginner,Full Gym), (Cable Incline Pushdown,beginner,Full Gym), (Cable Incline Triceps Extension,beginner,Full Gym), (Cable Internal Rotation,beginner,Full Gym), (Cable Iron Cross,beginner,Full Gym), (Cable Judo Flip,beginner,Full Gym), (Cable Lying Triceps Extension,beginner,Full Gym), (Cable One Arm Tricep Extension,beginner,Full Gym), (Cable Preacher Curl,beginner,Full Gym), (Cable Rear Delt Fly,beginner,Full Gym), (Cable Reverse Crunch,beginner,Full Gym), (Cable Rope Overhead Triceps Extension,beginner,Full Gym), (Cable Rope Rear-Delt Rows,beginner,Full Gym), (Cable Russian Twists,beginner,Full Gym), (Cable Seated Crunch,beginner,Full Gym), (Cable Seated Lateral Raise,beginner,Full Gym), (Cable Shoulder Press,beginner,Full Gym), (Cable Shrugs,beginner,Full Gym), (Cable Wrist Curl,beginner,Full Gym), (Calf-Machine Shoulder Shrug,beginner,Full Gym), (Calf Press,beginner,Full Gym), (Calf Press On The Leg Press Machine,beginner,Full Gym), (Calf Raises - With Bands,beginner,Home Gym), (Calf Raise On A Dumbbell,intermediate,Home Gym), (Calf Stretch Elbows Against Wall,beginner,Full Gym), (Calf Stretch Hands Against Wall,beginner,Full Gym), (Calves-SMR,intermediate,Home Gym), (Carioca Quick Step,beginner,Full Gym), (Car Deadlift,intermediate,Full Gym), (Car Drivers,beginner,Full Gym), (Catch and Overhead Throw,beginner,Home Gym), (Cat Stretch,beginner,Full Gym), (Chain Handle Extension,intermediate,Full Gym), (Chain Press,intermediate,Full Gym), (Chair Leg Extended Stretch,beginner,Full Gym), (Chair Lower Back Stretch,beginner,Full Gym), (Chair Squat,beginner,Full Gym), (Chair Upper Body Stretch,beginner,Full Gym), (Chest And Front Of Shoulder Stretch,beginner,Full Gym), (Chest Push (multiple response),beginner,Home Gym), (Chest Push (single response),beginner,Home Gym), (Chest Push from 3 point stance,beginner,Home Gym), (Chest Push with Run Release,beginner,Home Gym), (Chest Stretch on Stability Ball,beginner,Full Gym), (Child's Pose,beginner,Full Gym), (Chin-Up,beginner,Body Only), (Chin To Chest Stretch,beginner,Full Gym), (Circus Bell,expert,Full Gym), (Clean,intermediate,Full Gym), (Clean and Jerk,expert,Full Gym), (Clean and Press,intermediate,Full Gym), (Clean Deadlift,beginner,Full Gym), (Clean from Blocks,intermediate,Full Gym), (Clean Pull,intermediate,Full Gym), (Clean Shrug,beginner,Full Gym), (Clock Push-Up,intermediate,Body Only), (Close-Grip Barbell Bench Press,beginner,Full Gym), (Close-Grip Dumbbell Press,beginner,Home Gym), (Close-Grip EZ-Bar Curl with Band,beginner,Full Gym), (Close-Grip EZ-Bar Press,beginner,Full Gym), (Close-Grip EZ Bar Curl,beginner,Full Gym), (Close-Grip Front Lat Pulldown,beginner,Full Gym), (Close-Grip Push-Up off of a Dumbbell,intermediate,Body Only), (Close-Grip Standing Barbell Curl,beginner,Full Gym), (Cocoons,beginner,Body Only), (Conan's Wheel,intermediate,Full Gym), (Concentration Curls,beginner,Home Gym), (Cross-Body Crunch,beginner,Body Only), (Crossover Reverse Lunge,intermediate,Full Gym), (Cross Body Hammer Curl,beginner,Home Gym), (Cross Over - With Bands,beginner,Home Gym), (Crucifix,beginner,Full Gym), (Crunches,beginner,Body Only), (Crunch - Hands Overhead,beginner,Body Only), (Crunch - Legs On Exercise Ball,beginner,Body Only), (Cuban Press,intermediate,Home Gym), (Dancer's Stretch,beginner,Full Gym), (Deadlift with Bands,expert,Full Gym), (Deadlift with Chains,expert,Full Gym), (Dead Bug,beginner,Body Only), (Decline Barbell Bench Press,beginner,Full Gym), (Decline Close-Grip Bench To Skull Crusher,intermediate,Full Gym), (Decline Crunch,intermediate,Body Only), (Decline Dumbbell Bench Press,beginner,Home Gym), (Decline Dumbbell Flyes,beginner,Home Gym), (Decline Dumbbell Triceps Extension,beginner,Home Gym), (Decline EZ Bar Triceps Extension,beginner,Full Gym), (Decline Oblique Crunch,beginner,Body Only), (Decline Push-Up,beginner,Full Gym), (Decline Reverse Crunch,beginner,Body Only), (Decline Smith Press,beginner,Full Gym), (Deficit Deadlift,intermediate,Full Gym), (Depth Jump Leap,beginner,Full Gym), (Dips - Chest Version,intermediate,Full Gym), (Dips - Triceps Version,beginner,Body Only), (Dip Machine,beginner,Full Gym), (Donkey Calf Raises,intermediate,Full Gym), (Double Kettlebell Alternating Hang Clean,intermediate,Home Gym), (Double Kettlebell Jerk,intermediate,Home Gym), (Double Kettlebell Push Press,intermediate,Home Gym), (Double Kettlebell Snatch,expert,Home Gym), (Double Kettlebell Windmill,intermediate,Home Gym), (Double Leg Butt Kick,beginner,Body Only), (Downward Facing Balance,intermediate,Full Gym), (Drag Curl,intermediate,Full Gym), (Drop Push,intermediate,Full Gym), (Dumbbell Alternate Bicep Curl,beginner,Home Gym), (Dumbbell Bench Press,beginner,Home Gym), (Dumbbell Bench Press with Neutral Grip,beginner,Home Gym), (Dumbbell Bicep Curl,beginner,Home Gym), (Dumbbell Clean,intermediate,Home Gym), (Dumbbell Floor Press,intermediate,Home Gym), (Dumbbell Flyes,beginner,Home Gym), (Dumbbell Incline Row,beginner,Home Gym), (Dumbbell Incline Shoulder Raise,beginner,Home Gym), (Dumbbell Lunges,beginner,Home Gym), (Dumbbell Lying One-Arm Rear Lateral Raise,intermediate,Home Gym), (Dumbbell Lying Pronation,intermediate,Home Gym), (Dumbbell Lying Rear Lateral Raise,intermediate,Home Gym), (Dumbbell Lying Supination,intermediate,Home Gym), (Dumbbell One-Arm Shoulder Press,intermediate,Home Gym), (Dumbbell One-Arm Triceps Extension,intermediate,Home Gym), (Dumbbell One-Arm Upright Row,intermediate,Home Gym), (Dumbbell Prone Incline Curl,intermediate,Home Gym), (Dumbbell Raise,beginner,Home Gym), (Dumbbell Rear Lunge,intermediate,Home Gym), (Dumbbell Scaption,beginner,Home Gym), (Dumbbell Seated Box Jump,intermediate,Home Gym), (Dumbbell Seated One-Leg Calf Raise,beginner,Home Gym), (Dumbbell Shoulder Press,intermediate,Home Gym), (Dumbbell Shrug,beginner,Home Gym), (Dumbbell Side Bend,beginner,Home Gym), (Dumbbell Squat,beginner,Home Gym), (Dumbbell Squat To A Bench,intermediate,Home Gym), (Dumbbell Step Ups,intermediate,Home Gym), (Dumbbell Tricep Extension -Pronated Grip,beginner,Home Gym), (Dynamic Back Stretch,beginner,Full Gym), (Dynamic Chest Stretch,beginner,Full Gym), (Elbows Back,beginner,Full Gym), (Elbow Circles,beginner,Full Gym), (Elbow to Knee,beginner,Body Only), (Elevated Back Lunge,intermediate,Full Gym), (Elevated Cable Rows,intermediate,Full Gym), (Elliptical Trainer,intermediate,Full Gym), (Exercise Ball Crunch,beginner,Full Gym), (Exercise Ball Pull-In,beginner,Full Gym), (Extended Range One-Arm Kettlebell Floor Press,beginner,Home Gym), (External Rotation,beginner,Home Gym), (External Rotation with Band,beginner,Home Gym), (External Rotation with Cable,beginner,Full Gym), (EZ-Bar Curl,beginner,Full Gym), (EZ-Bar Skullcrusher,beginner,Full Gym), (Face Pull,intermediate,Full Gym), (Farmer's Walk,intermediate,Full Gym), (Fast Skipping,beginner,Body Only), (Finger Curls,beginner,Full Gym), (Flat Bench Cable Flyes,intermediate,Full Gym), (Flat Bench Leg Pull-In,beginner,Body Only), (Flat Bench Lying Leg Raise,beginner,Body Only), (Flexor Incline Dumbbell Curls,beginner,Home Gym), (Floor Glute-Ham Raise,intermediate,Full Gym), (Floor Press,intermediate,Full Gym), (Floor Press with Chains,intermediate,Full Gym), (Flutter Kicks,beginner,Body Only), (Foot-SMR,intermediate,Full Gym), (Forward Drag with Press,intermediate,Full Gym), (Frankenstein Squat,intermediate,Full Gym), (Freehand Jump Squat,intermediate,Body Only), (Frog Hops,intermediate,Full Gym), (Frog Sit-Ups,intermediate,Body Only), (Front Barbell Squat,expert,Full Gym), (Front Barbell Squat To A Bench,expert,Full Gym), (Front Box Jump,beginner,Full Gym), (Front Cable Raise,beginner,Full Gym), (Front Cone Hops (or hurdle hops),beginner,Full Gym), (Front Dumbbell Raise,beginner,Home Gym), (Front Incline Dumbbell Raise,beginner,Home Gym), (Front Leg Raises,beginner,Body Only), (Front Plate Raise,intermediate,Full Gym), (Front Raise And Pullover,beginner,Full Gym), (Front Squats With Two Kettlebells,intermediate,Home Gym), (Front Squat (Clean Grip),intermediate,Full Gym), (Front Two-Dumbbell Raise,beginner,Home Gym), (Full Range-Of-Motion Lat Pulldown,intermediate,Full Gym), (Gironda Sternum Chins,intermediate,Full Gym), (Glute Ham Raise,intermediate,Full Gym), (Glute Kickback,beginner,Body Only), (Goblet Squat,beginner,Home Gym), (Good Morning,intermediate,Full Gym), (Good Morning off Pins,intermediate,Full Gym), (Gorilla Chin/Crunch,intermediate,Body Only), (Groiners,intermediate,Body Only), (Groin and Back Stretch,intermediate,Full Gym), (Hack Squat,beginner,Full Gym), (Hammer Curls,beginner,Home Gym), (Hammer Grip Incline DB Bench Press,beginner,Home Gym), (Hamstring-SMR,beginner,Home Gym), (Hamstring Stretch,beginner,Full Gym), (Handstand Push-Ups,expert,Body Only), (Hanging Bar Good Morning,intermediate,Full Gym), (Hanging Leg Raise,expert,Body Only), (Hanging Pike,expert,Body Only), (Hang Clean,intermediate,Full Gym), (Hang Clean - Below the Knees,intermediate,Full Gym), (Hang Snatch,expert,Full Gym), (Hang Snatch - Below Knees,expert,Full Gym), (Heaving Snatch Balance,intermediate,Full Gym), (Heavy Bag Thrust,beginner,Full Gym), (High Cable Curls,intermediate,Full Gym), (Hip Circles (prone),beginner,Body Only), (Hip Extension with Bands,beginner,Home Gym), (Hip Flexion with Band,beginner,Home Gym), (Hip Lift with Band,beginner,Home Gym), (Hug A Ball,beginner,Full Gym), (Hug Knees To Chest,beginner,Full Gym), (Hurdle Hops,beginner,Full Gym), (Hyperextensions (Back Extensions),beginner,Full Gym), (Hyperextensions With No Hyperextension Bench,intermediate,Body Only), (Iliotibial Tract-SMR,intermediate,Home Gym), (Inchworm,beginner,Body Only), (Incline Barbell Triceps Extension,intermediate,Full Gym), (Incline Bench Pull,beginner,Full Gym), (Incline Cable Chest Press,beginner,Full Gym), (Incline Cable Flye,intermediate,Full Gym), (Incline Dumbbell Bench With Palms Facing In,beginner,Home Gym), (Incline Dumbbell Curl,beginner,Home Gym), (Incline Dumbbell Flyes,beginner,Home Gym), (Incline Dumbbell Flyes - With A Twist,beginner,Home Gym), (Incline Dumbbell Press,beginner,Home Gym), (Incline Hammer Curls,beginner,Home Gym), (Incline Inner Biceps Curl,beginner,Home Gym), (Incline Push-Up,beginner,Body Only), (Incline Push-Up Close-Grip,beginner,Body Only), (Incline Push-Up Depth Jump,beginner,Full Gym), (Incline Push-Up Medium,beginner,Body Only), (Incline Push-Up Reverse Grip,beginner,Body Only), (Incline Push-Up Wide,beginner,Body Only), (Intermediate Groin Stretch,intermediate,Full Gym), (Intermediate Hip Flexor and Quad Stretch,intermediate,Full Gym), (Internal Rotation with Band,beginner,Home Gym), (Inverted Row,beginner,Full Gym), (Inverted Row with Straps,beginner,Full Gym), (Iron Cross,intermediate,Home Gym), (Iron Crosses (stretch),intermediate,Full Gym), (Isometric Chest Squeezes,beginner,Body Only), (Isometric Neck Exercise - Front And Back,beginner,Body Only), (Isometric Neck Exercise - Sides,beginner,Body Only), (Isometric Wipers,beginner,Body Only), (IT Band and Glute Stretch,intermediate,Full Gym), (Jackknife Sit-Up,beginner,Body Only), (Janda Sit-Up,beginner,Body Only), (Jefferson Squats,intermediate,Full Gym), (Jerk Balance,intermediate,Full Gym), (Jerk Dip Squat,intermediate,Full Gym), (JM Press,beginner,Full Gym), (Jogging, Treadmill,beginner,Full Gym), (Keg Load,intermediate,Full Gym), (Kettlebell Arnold Press,intermediate,Home Gym), (Kettlebell Dead Clean,intermediate,Home Gym), (Kettlebell Figure 8,intermediate,Home Gym), (Kettlebell Hang Clean,intermediate,Home Gym), (Kettlebell One-Legged Deadlift,intermediate,Home Gym), (Kettlebell Pass Between The Legs,intermediate,Home Gym), (Kettlebell Pirate Ships,beginner,Home Gym), (Kettlebell Pistol Squat,expert,Home Gym), (Kettlebell Seated Press,intermediate,Home Gym), (Kettlebell Seesaw Press,intermediate,Home Gym), (Kettlebell Sumo High Pull,intermediate,Home Gym), (Kettlebell Thruster,intermediate,Home Gym), (Kettlebell Turkish Get-Up (Lunge style),intermediate,Home Gym), (Kettlebell Turkish Get-Up (Squat style),intermediate,Home Gym), (Kettlebell Windmill,intermediate,Home Gym), (Kipping Muscle Up,intermediate,Full Gym), (Kneeling Arm Drill,beginner,Full Gym), (Kneeling Cable Crunch With Alternating Oblique Twists,beginner,Full Gym), (Kneeling Cable Triceps Extension,intermediate,Full Gym), (Kneeling Forearm Stretch,beginner,Full Gym), (Kneeling High Pulley Row,beginner,Full Gym), (Kneeling Hip Flexor,beginner,Full Gym), (Kneeling Jump Squat,expert,Full Gym), (Kneeling Single-Arm High Pulley Row,beginner,Full Gym), (Kneeling Squat,intermediate,Full Gym), (Knee Across The Body,beginner,Full Gym), (Knee Circles,beginner,Body Only), (Knee/Hip Raise On Parallel Bars,beginner,Full Gym), (Knee Tuck Jump,beginner,Body Only), (Landmine 180's,beginner,Full Gym), (Landmine Linear Jammer,intermediate,Full Gym), (Lateral Bound,beginner,Body Only), (Lateral Box Jump,beginner,Full Gym), (Lateral Cone Hops,beginner,Full Gym), (Lateral Raise - With Bands,beginner,Home Gym), (Latissimus Dorsi-SMR,beginner,Home Gym), (Leg-Over Floor Press,intermediate,Home Gym), (Leg-Up Hamstring Stretch,beginner,Full Gym), (Leg Extensions,beginner,Full Gym), (Leg Lift,beginner,Body Only), (Leg Press,beginner,Full Gym), (Leg Pull-In,beginner,Body Only), (Leverage Chest Press,beginner,Full Gym), (Leverage Deadlift,beginner,Full Gym), (Leverage Decline Chest Press,beginner,Full Gym), (Leverage High Row,beginner,Full Gym), (Leverage Incline Chest Press,beginner,Full Gym), (Leverage Iso Row,beginner,Full Gym), (Leverage Shoulder Press,beginner,Full Gym), (Leverage Shrug,beginner,Full Gym), (Linear 3-Part Start Technique,beginner,Full Gym), (Linear Acceleration Wall Drill,beginner,Full Gym), (Linear Depth Jump,intermediate,Full Gym), (Log Lift,intermediate,Full Gym), (London Bridges,intermediate,Full Gym), (Looking At Ceiling,beginner,Full Gym), (Lower Back-SMR,beginner,Home Gym), (Lower Back Curl,beginner,Body Only), (Low Cable Crossover,beginner,Full Gym), (Low Cable Triceps Extension,beginner,Full Gym), (Low Pulley Row To Neck,beginner,Full Gym), (Lunge Pass Through,intermediate,Home Gym), (Lunge Sprint,intermediate,Full Gym), (Lying Bent Leg Groin,expert,Full Gym), (Lying Cable Curl,intermediate,Full Gym), (Lying Cambered Barbell Row,beginner,Full Gym), (Lying Close-Grip Barbell Triceps Extension Behind The Head,intermediate,Full Gym), (Lying Close-Grip Barbell Triceps Press To Chin,intermediate,Full Gym), (Lying Close-Grip Bar Curl On High Pulley,beginner,Full Gym), (Lying Crossover,expert,Body Only), (Lying Dumbbell Tricep Extension,intermediate,Home Gym), (Lying Face Down Plate Neck Resistance,intermediate,Full Gym), (Lying Face Up Plate Neck Resistance,intermediate,Full Gym), (Lying Glute,expert,Body Only), (Lying Hamstring,expert,Full Gym), (Lying High Bench Barbell Curl,intermediate,Full Gym), (Lying Leg Curls,beginner,Full Gym), (Lying Machine Squat,intermediate,Full Gym), (Lying One-Arm Lateral Raise,intermediate,Home Gym), (Lying Prone Quadriceps,expert,Body Only), (Lying Rear Delt Raise,intermediate,Home Gym), (Lying Supine Dumbbell Curl,beginner,Home Gym), (Lying T-Bar Row,intermediate,Full Gym), (Lying Triceps Press,intermediate,Full Gym), (Machine Bench Press,beginner,Full Gym), (Machine Bicep Curl,beginner,Full Gym), (Machine Preacher Curls,beginner,Full Gym), (Machine Shoulder (Military) Press,beginner,Full Gym), (Machine Triceps Extension,beginner,Full Gym), (Medicine Ball Chest Pass,beginner,Home Gym), (Medicine Ball Full Twist,beginner,Home Gym), (Medicine Ball Scoop Throw,beginner,Home Gym), (Middle Back Shrug,intermediate,Home Gym), (Middle Back Stretch,beginner,Full Gym), (Mixed Grip Chin,expert,Full Gym), (Monster Walk,beginner,Home Gym), (Mountain Climbers,beginner,Full Gym), (Moving Claw Series,beginner,Full Gym), (Muscle Snatch,intermediate,Full Gym), (Muscle Up,intermediate,Full Gym), (Narrow Stance Hack Squats,intermediate,Full Gym), (Narrow Stance Leg Press,intermediate,Full Gym), (Narrow Stance Squats,intermediate,Full Gym), (Natural Glute Ham Raise,intermediate,Body Only), (Neck-SMR,intermediate,Full Gym), (Neck Press,intermediate,Full Gym), (Oblique Crunches,beginner,Body Only), (Oblique Crunches - On The Floor,beginner,Body Only), (Olympic Squat,intermediate,Full Gym), (On-Your-Back Quad Stretch,beginner,Full Gym), (One-Arm Dumbbell Row,beginner,Home Gym), (One-Arm Flat Bench Dumbbell Flye,beginner,Home Gym), (One-Arm High-Pulley Cable Side Bends,beginner,Full Gym), (One-Arm Incline Lateral Raise,beginner,Home Gym), (One-Arm Kettlebell Clean,intermediate,Home Gym), (One-Arm Kettlebell Clean and Jerk,intermediate,Home Gym), (One-Arm Kettlebell Floor Press,intermediate,Home Gym), (One-Arm Kettlebell Jerk,intermediate,Home Gym), (One-Arm Kettlebell Military Press To The Side,intermediate,Home Gym), (One-Arm Kettlebell Para Press,intermediate,Home Gym), (One-Arm Kettlebell Push Press,intermediate,Home Gym), (One-Arm Kettlebell Row,intermediate,Home Gym), (One-Arm Kettlebell Snatch,expert,Home Gym), (One-Arm Kettlebell Split Jerk,intermediate,Home Gym), (One-Arm Kettlebell Split Snatch,expert,Home Gym), (One-Arm Kettlebell Swings,intermediate,Home Gym), (One-Arm Long Bar Row,beginner,Full Gym), (One-Arm Medicine Ball Slam,beginner,Home Gym), (One-Arm Open Palm Kettlebell Clean,intermediate,Home Gym), (One-Arm Overhead Kettlebell Squats,expert,Home Gym), (One-Arm Side Deadlift,expert,Full Gym), (One-Arm Side Laterals,beginner,Home Gym), (One-Legged Cable Kickback,intermediate,Full Gym), (One Arm Against Wall,beginner,Full Gym), (One Arm Chin-Up,expert,Full Gym), (One Arm Dumbbell Bench Press,beginner,Home Gym), (One Arm Dumbbell Preacher Curl,beginner,Home Gym), (One Arm Floor Press,intermediate,Full Gym), (One Arm Lat Pulldown,beginner,Full Gym), (One Arm Pronated Dumbbell Triceps Extension,beginner,Home Gym), (One Arm Supinated Dumbbell Triceps Extension,beginner,Home Gym), (One Half Locust,beginner,Full Gym), (One Handed Hang,beginner,Full Gym), (One Knee To Chest,beginner,Full Gym), (One Leg Barbell Squat,expert,Full Gym), (On Your Side Quad Stretch,beginner,Full Gym), (Open Palm Kettlebell Clean,expert,Home Gym), (Otis-Up,beginner,Full Gym), (Overhead Cable Curl,intermediate,Full Gym), (Overhead Lat,expert,Full Gym), (Overhead Slam,beginner,Home Gym), (Overhead Squat,expert,Full Gym), (Overhead Stretch,beginner,Full Gym), (Overhead Triceps,expert,Body Only), (Pallof Press,beginner,Full Gym), (Pallof Press With Rotation,beginner,Full Gym), (Palms-Down Dumbbell Wrist Curl Over A Bench,beginner,Home Gym), (Palms-Down Wrist Curl Over A Bench,beginner,Full Gym), (Palms-Up Barbell Wrist Curl Over A Bench,beginner,Full Gym), (Palms-Up Dumbbell Wrist Curl Over A Bench,beginner,Home Gym), (Parallel Bar Dip,beginner,Full Gym), (Pelvic Tilt Into Bridge,intermediate,Full Gym), (Peroneals-SMR,intermediate,Home Gym), (Peroneals Stretch,intermediate,Full Gym), (Physioball Hip Bridge,beginner,Full Gym), (Pin Presses,intermediate,Full Gym), (Piriformis-SMR,intermediate,Home Gym), (Plank,beginner,Body Only), (Plate Pinch,intermediate,Full Gym), (Plate Twist,intermediate,Full Gym), (Platform Hamstring Slides,beginner,Full Gym), (Plie Dumbbell Squat,beginner,Home Gym), (Plyo Kettlebell Pushups,expert,Home Gym), (Plyo Push-up,beginner,Body Only), (Posterior Tibialis Stretch,intermediate,Full Gym), (Power Clean,intermediate,Full Gym), (Power Clean from Blocks,intermediate,Full Gym), (Power Jerk,expert,Full Gym), (Power Partials,beginner,Home Gym), (Power Snatch,expert,Full Gym), (Power Snatch from Blocks,intermediate,Full Gym), (Power Stairs,intermediate,Full Gym), (Preacher Curl,beginner,Full Gym), (Preacher Hammer Dumbbell Curl,beginner,Home Gym), (Press Sit-Up,expert,Full Gym), (Prone Manual Hamstring,beginner,Full Gym), (Prowler Sprint,beginner,Full Gym), (Pullups,beginner,Body Only), (Pull Through,beginner,Full Gym), (Push-Ups - Close Triceps Position,intermediate,Body Only), (Push-Ups With Feet Elevated,beginner,Body Only), (Push-Ups With Feet On An Exercise Ball,intermediate,Full Gym), (Push-Up Wide,beginner,Body Only), (Pushups,beginner,Body Only), (Pushups (Close and Wide Hand Positions),beginner,Body Only), (Push Press,expert,Full Gym), (Push Press - Behind the Neck,intermediate,Full Gym), (Push Up to Side Plank,beginner,Body Only), (Pyramid,beginner,Full Gym), (Quadriceps-SMR,intermediate,Home Gym), (Quad Stretch,intermediate,Full Gym), (Quick Leap,beginner,Full Gym), (Rack Delivery,intermediate,Full Gym), (Rack Pulls,intermediate,Full Gym), (Rack Pull with Bands,intermediate,Full Gym), (Rear Leg Raises,beginner,Body Only), (Recumbent Bike,beginner,Full Gym), (Return Push from Stance,beginner,Home Gym), (Reverse Band Bench Press,intermediate,Full Gym), (Reverse Band Box Squat,intermediate,Full Gym), (Reverse Band Deadlift,expert,Full Gym), (Reverse Band Power Squat,expert,Full Gym), (Reverse Band Sumo Deadlift,expert,Full Gym), (Reverse Barbell Curl,beginner,Full Gym), (Reverse Barbell Preacher Curls,intermediate,Full Gym), (Reverse Cable Curl,beginner,Full Gym), (Reverse Crunch,beginner,Body Only), (Reverse Flyes,beginner,Home Gym), (Reverse Flyes With External Rotation,intermediate,Home Gym), (Reverse Grip Bent-Over Rows,intermediate,Full Gym), (Reverse Grip Triceps Pushdown,beginner,Full Gym), (Reverse Hyperextension,intermediate,Full Gym), (Reverse Machine Flyes,beginner,Full Gym), (Reverse Plate Curls,beginner,Full Gym), (Reverse Triceps Bench Press,intermediate,Full Gym), (Rhomboids-SMR,intermediate,Home Gym), (Rickshaw Carry,intermediate,Full Gym), (Rickshaw Deadlift,intermediate,Full Gym), (Ring Dips,intermediate,Full Gym), (Rocket Jump,beginner,Body Only), (Rocking Standing Calf Raise,beginner,Full Gym), (Rocky Pull-Ups/Pulldowns,intermediate,Full Gym), (Romanian Deadlift,intermediate,Full Gym), (Romanian Deadlift from Deficit,intermediate,Full Gym), (Rope Climb,intermediate,Full Gym), (Rope Crunch,beginner,Full Gym), (Rope Jumping,intermediate,Full Gym), (Rope Straight-Arm Pulldown,beginner,Full Gym), (Round The World Shoulder Stretch,beginner,Full Gym), (Rowing, Stationary,intermediate,Full Gym), (Runner's Stretch,beginner,Full Gym), (Running, Treadmill,beginner,Full Gym), (Russian Twist,intermediate,Body Only), (Sandbag Load,beginner,Full Gym), (Scapular Pull-Up,beginner,Full Gym), (Scissors Jump,beginner,Body Only), (Scissor Kick,beginner,Body Only), (Seated Band Hamstring Curl,beginner,Full Gym), (Seated Barbell Military Press,intermediate,Full Gym), (Seated Barbell Twist,beginner,Full Gym), (Seated Bent-Over One-Arm Dumbbell Triceps Extension,beginner,Home Gym), (Seated Bent-Over Rear Delt Raise,intermediate,Home Gym), (Seated Bent-Over Two-Arm Dumbbell Triceps Extension,intermediate,Home Gym), (Seated Biceps,expert,Body Only), (Seated Cable Rows,beginner,Full Gym), (Seated Cable Shoulder Press,beginner,Full Gym), (Seated Calf Raise,beginner,Full Gym), (Seated Calf Stretch,beginner,Full Gym), (Seated Close-Grip Concentration Barbell Curl,intermediate,Full Gym), (Seated Dumbbell Curl,beginner,Home Gym), (Seated Dumbbell Inner Biceps Curl,beginner,Home Gym), (Seated Dumbbell Palms-Down Wrist Curl,beginner,Home Gym), (Seated Dumbbell Palms-Up Wrist Curl,beginner,Home Gym), (Seated Dumbbell Press,beginner,Home Gym), (Seated Flat Bench Leg Pull-In,beginner,Body Only), (Seated Floor Hamstring Stretch,beginner,Full Gym), (Seated Front Deltoid,expert,Body Only), (Seated Glute,expert,Body Only), (Seated Good Mornings,intermediate,Full Gym), (Seated Hamstring,expert,Full Gym), (Seated Hamstring and Calf Stretch,intermediate,Full Gym), (Seated Head Harness Neck Resistance,intermediate,Full Gym), (Seated Leg Curl,beginner,Full Gym), (Seated Leg Tucks,beginner,Body Only), (Seated One-arm Cable Pulley Rows,intermediate,Full Gym), (Seated One-Arm Dumbbell Palms-Down Wrist Curl,intermediate,Home Gym), (Seated One-Arm Dumbbell Palms-Up Wrist Curl,beginner,Home Gym), (Seated Overhead Stretch,beginner,Full Gym), (Seated Palm-Up Barbell Wrist Curl,beginner,Full Gym), (Seated Palms-Down Barbell Wrist Curl,beginner,Full Gym), (Seated Side Lateral Raise,beginner,Home Gym), (Seated Triceps Press,beginner,Home Gym), (Seated Two-Arm Palms-Up Low-Pulley Wrist Curl,beginner,Full Gym), (See-Saw Press (Alternating Side Press),intermediate,Home Gym), (Shotgun Row,beginner,Full Gym), (Shoulder Circles,beginner,Full Gym), (Shoulder Press - With Bands,beginner,Home Gym), (Shoulder Raise,beginner,Full Gym), (Shoulder Stretch,beginner,Full Gym), (Side-Lying Floor Stretch,beginner,Full Gym), (Side Bridge,beginner,Body Only), (Side Hop-Sprint,beginner,Full Gym), (Side Jackknife,beginner,Body Only), (Side Laterals to Front Raise,beginner,Home Gym), (Side Lateral Raise,beginner,Home Gym), (Side Leg Raises,beginner,Body Only), (Side Lying Groin Stretch,beginner,Full Gym), (Side Neck Stretch,beginner,Full Gym), (Side Standing Long Jump,beginner,Full Gym), (Side to Side Box Shuffle,beginner,Full Gym), (Side To Side Chins,intermediate,Full Gym), (Side Wrist Pull,beginner,Full Gym), (Single-Arm Cable Crossover,beginner,Full Gym), (Single-Arm Linear Jammer,intermediate,Full Gym), (Single-Arm Push-Up,intermediate,Body Only), (Single-Cone Sprint Drill,beginner,Full Gym), (Single-Leg High Box Squat,beginner,Full Gym), (Single-Leg Hop Progression,beginner,Full Gym), (Single-Leg Lateral Hop,beginner,Full Gym), (Single-Leg Leg Extension,beginner,Full Gym), (Single-Leg Stride Jump,beginner,Full Gym), (Single Dumbbell Raise,beginner,Home Gym), (Single Leg Butt Kick,beginner,Body Only), (Single Leg Glute Bridge,beginner,Body Only), (Single Leg Push-off,beginner,Full Gym), (Sit-Up,beginner,Body Only), (Sit Squats,beginner,Full Gym), (Skating,intermediate,Full Gym), (Sledgehammer Swings,beginner,Full Gym), (Sled Drag - Harness,beginner,Full Gym), (Sled Overhead Backward Walk,beginner,Full Gym), (Sled Overhead Triceps Extension,beginner,Full Gym), (Sled Push,beginner,Full Gym), (Sled Reverse Flye,beginner,Full Gym), (Sled Row,beginner,Full Gym), (Smith Incline Shoulder Raise,beginner,Full Gym), (Smith Machine Behind the Back Shrug,beginner,Full Gym), (Smith Machine Bench Press,beginner,Full Gym), (Smith Machine Bent Over Row,beginner,Full Gym), (Smith Machine Calf Raise,beginner,Full Gym), (Smith Machine Close-Grip Bench Press,beginner,Full Gym), (Smith Machine Decline Press,beginner,Full Gym), (Smith Machine Hang Power Clean,intermediate,Full Gym), (Smith Machine Hip Raise,beginner,Full Gym), (Smith Machine Incline Bench Press,beginner,Full Gym), (Smith Machine Leg Press,intermediate,Full Gym), (Smith Machine One-Arm Upright Row,beginner,Full Gym), (Smith Machine Overhead Shoulder Press,beginner,Full Gym), (Smith Machine Pistol Squat,intermediate,Full Gym), (Smith Machine Reverse Calf Raises,beginner,Full Gym), (Smith Machine Squat,beginner,Full Gym), (Smith Machine Stiff-Legged Deadlift,beginner,Full Gym), (Smith Machine Upright Row,beginner,Full Gym), (Smith Single-Leg Split Squat,beginner,Full Gym), (Snatch,intermediate,Full Gym), (Snatch Balance,intermediate,Full Gym), (Snatch Deadlift,intermediate,Full Gym), (Snatch from Blocks,expert,Full Gym), (Snatch Pull,intermediate,Full Gym), (Snatch Shrug,intermediate,Full Gym), (Speed Band Overhead Triceps,beginner,Home Gym), (Speed Box Squat,intermediate,Full Gym), (Speed Squats,expert,Full Gym), (Spell Caster,beginner,Home Gym), (Spider Crawl,beginner,Body Only), (Spider Curl,beginner,Full Gym), (Spinal Stretch,beginner,Full Gym), (Split Clean,intermediate,Full Gym), (Split Jerk,intermediate,Full Gym), (Split Jump,beginner,Body Only), (Split Snatch,expert,Full Gym), (Split Squats,intermediate,Full Gym), (Split Squat with Dumbbells,beginner,Home Gym), (Squats - With Bands,beginner,Home Gym), (Squat Jerk,expert,Full Gym), (Squat with Bands,intermediate,Full Gym), (Squat with Chains,intermediate,Full Gym), (Squat with Plate Movers,intermediate,Full Gym), (Stairmaster,intermediate,Full Gym), (Standing Alternating Dumbbell Press,beginner,Home Gym), (Standing Barbell Calf Raise,beginner,Full Gym), (Standing Barbell Press Behind Neck,intermediate,Full Gym), (Standing Bent-Over One-Arm Dumbbell Triceps Extension,beginner,Home Gym), (Standing Bent-Over Two-Arm Dumbbell Triceps Extension,beginner,Home Gym), (Standing Biceps Cable Curl,beginner,Full Gym), (Standing Biceps Stretch,beginner,Full Gym), (Standing Bradford Press,beginner,Full Gym), (Standing Cable Chest Press,beginner,Full Gym), (Standing Cable Lift,beginner,Full Gym), (Standing Cable Wood Chop,beginner,Full Gym), (Standing Calf Raises,beginner,Full Gym), (Standing Concentration Curl,beginner,Home Gym), (Standing Dumbbell Calf Raise,intermediate,Home Gym), (Standing Dumbbell Press,beginner,Home Gym), (Standing Dumbbell Reverse Curl,intermediate,Home Gym), (Standing Dumbbell Straight-Arm Front Delt Raise Above Head,intermediate,Home Gym), (Standing Dumbbell Triceps Extension,beginner,Home Gym), (Standing Dumbbell Upright Row,beginner,Home Gym), (Standing Elevated Quad Stretch,beginner,Full Gym), (Standing Front Barbell Raise Over Head,intermediate,Full Gym), (Standing Gastrocnemius Calf Stretch,beginner,Full Gym), (Standing Hamstring and Calf Stretch,beginner,Full Gym), (Standing Hip Circles,beginner,Body Only), (Standing Hip Flexors,beginner,Full Gym), (Standing Inner-Biceps Curl,intermediate,Home Gym), (Standing Lateral Stretch,beginner,Full Gym), (Standing Leg Curl,beginner,Full Gym), (Standing Long Jump,beginner,Body Only), (Standing Low-Pulley Deltoid Raise,beginner,Full Gym), (Standing Low-Pulley One-Arm Triceps Extension,intermediate,Full Gym), (Standing Military Press,beginner,Full Gym), (Standing Olympic Plate Hand Squeeze,beginner,Full Gym), (Standing One-Arm Cable Curl,intermediate,Full Gym), (Standing One-Arm Dumbbell Curl Over Incline Bench,beginner,Home Gym), (Standing One-Arm Dumbbell Triceps Extension,beginner,Home Gym), (Standing Overhead Barbell Triceps Extension,beginner,Full Gym), (Standing Palm-In One-Arm Dumbbell Press,beginner,Home Gym), (Standing Palms-In Dumbbell Press,intermediate,Home Gym), (Standing Palms-Up Barbell Behind The Back Wrist Curl,beginner,Full Gym), (Standing Pelvic Tilt,beginner,Full Gym), (Standing Rope Crunch,beginner,Full Gym), (Standing Soleus And Achilles Stretch,beginner,Full Gym), (Standing Toe Touches,beginner,Full Gym), (Standing Towel Triceps Extension,beginner,Body Only), (Standing Two-Arm Overhead Throw,beginner,Home Gym), (Star Jump,beginner,Body Only), (Step-up with Knee Raise,beginner,Body Only), (Step Mill,intermediate,Full Gym), (Stiff-Legged Barbell Deadlift,intermediate,Full Gym), (Stiff-Legged Dumbbell Deadlift,beginner,Home Gym), (Stiff Leg Barbell Good Morning,beginner,Full Gym), (Stomach Vacuum,beginner,Body Only), (Straight-Arm Dumbbell Pullover,intermediate,Home Gym), (Straight-Arm Pulldown,beginner,Full Gym), (Straight Bar Bench Mid Rows,beginner,Full Gym), (Straight Raises on Incline Bench,beginner,Full Gym), (Stride Jump Crossover,beginner,Full Gym), (Sumo Deadlift,intermediate,Full Gym), (Sumo Deadlift with Bands,intermediate,Full Gym), (Sumo Deadlift with Chains,intermediate,Full Gym), (Superman,beginner,Body Only), (Supine Chest Throw,beginner,Home Gym), (Supine One-Arm Overhead Throw,beginner,Home Gym), (Supine Two-Arm Overhead Throw,beginner,Home Gym), (Suspended Fallout,intermediate,Full Gym), (Suspended Push-Up,beginner,Full Gym), (Suspended Reverse Crunch,beginner,Full Gym), (Suspended Row,beginner,Full Gym), (Suspended Split Squat,intermediate,Full Gym), (Svend Press,beginner,Full Gym), (T-Bar Row with Handle,beginner,Full Gym), (Tate Press,intermediate,Home Gym), (The Straddle,beginner,Full Gym), (Thigh Abductor,beginner,Full Gym), (Thigh Adductor,beginner,Full Gym), (Tire Flip,intermediate,Full Gym), (Toe Touchers,beginner,Body Only), (Torso Rotation,beginner,Full Gym), (Trail Running/Walking,beginner,Full Gym), (Trap Bar Deadlift,beginner,Full Gym), (Triceps Overhead Extension with Rope,beginner,Full Gym), (Triceps Pushdown,beginner,Full Gym), (Triceps Pushdown - Rope Attachment,beginner,Full Gym), (Triceps Pushdown - V-Bar Attachment,beginner,Full Gym), (Triceps Stretch,beginner,Full Gym), (Tricep Dumbbell Kickback,beginner,Home Gym), (Tricep Side Stretch,beginner,Full Gym), (Tuck Crunch,beginner,Body Only), (Two-Arm Dumbbell Preacher Curl,beginner,Home Gym), (Two-Arm Kettlebell Clean,intermediate,Home Gym), (Two-Arm Kettlebell Jerk,intermediate,Home Gym), (Two-Arm Kettlebell Military Press,intermediate,Home Gym), (Two-Arm Kettlebell Row,intermediate,Home Gym), (Underhand Cable Pulldowns,beginner,Full Gym), (Upper Back-Leg Grab,beginner,Full Gym), (Upper Back Stretch,beginner,Full Gym), (Upright Barbell Row,beginner,Full Gym), (Upright Cable Row,intermediate,Full Gym), (Upright Row - With Bands,beginner,Home Gym), (Upward Stretch,beginner,Full Gym), (V-Bar Pulldown,intermediate,Full Gym), (V-Bar Pullup,beginner,Body Only), (Vertical Swing,beginner,Home Gym), (Walking, Treadmill,beginner,Full Gym), (Weighted Ball Hyperextension,intermediate,Full Gym), (Weighted Ball Side Bend,intermediate,Full Gym), (Weighted Bench Dip,intermediate,Full Gym), (Weighted Crunches,beginner,Home Gym), (Weighted Jump Squat,intermediate,Full Gym), (Weighted Pull Ups,intermediate,Full Gym), (Weighted Sissy Squat,expert,Full Gym), (Weighted Sit-Ups - With Bands,intermediate,Full Gym), (Weighted Squat,intermediate,Full Gym), (Wide-Grip Barbell Bench Press,intermediate,Full Gym), (Wide-Grip Decline Barbell Bench Press,intermediate,Full Gym), (Wide-Grip Decline Barbell Pullover,intermediate,Full Gym), (Wide-Grip Lat Pulldown,beginner,Full Gym), (Wide-Grip Pulldown Behind The Neck,intermediate,Full Gym), (Wide-Grip Rear Pull-Up,intermediate,Body Only), (Wide-Grip Standing Barbell Curl,beginner,Full Gym), (Wide Stance Barbell Squat,intermediate,Full Gym), (Wide Stance Stiff Legs,intermediate,Full Gym), (Windmills,intermediate,Full Gym), (Wind Sprints,beginner,Body Only), (World's Greatest Stretch,intermediate,Full Gym), (Wrist Circles,beginner,Body Only), (Wrist Roller,beginner,Full Gym), (Wrist Rotations with Straight Bar,beginner,Full Gym), (Yoke Walk,intermediate,Full Gym), (Zercher Squats,expert,Full Gym), (Zottman Curl,intermediate,Home Gym), (Zottman Preacher Curl,intermediate,Home Gym)`;

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