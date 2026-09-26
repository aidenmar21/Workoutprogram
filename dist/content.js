/* Course copy lives here. The 14-day titles come from Eliana's brief. The
   30-day interactive sessions are a working adaptation of her public guide
   description and social content; replace with her purchased guide's exact
   exercise order before selling access to this interactive version. */
const core30 = [
  ["Build Your Base","Learn to brace, breathe, and move without rushing.",["Reverse crunch","Slow bicycle","Forearm plank"],["Keep knees bent in the crunch.","Rest your feet between bicycle reps.","Plank from your knees or at a wall."]],
  ["Lower Core Focus","Let your lower core lead, with your back supported.",["Toe taps","Bent-knee lowers","Reverse crunch"],["Tap one foot at a time.","Shorten the lowering range."]],
  ["Side Body Sculpt","Slow rotation and steady hips.",["Side plank hold","Cross-body crunch","Standing side reach"],["Place your bottom knee on the floor."]],
  ["Plank Foundations","Build stability from shoulders through heels.",["High plank","Shoulder taps","Forearm plank"],["Use a wall or sturdy counter for planks."]],
  ["Slow Burn","Make each rep feel intentional.",["Slow bicycle","Reach crunch","Dead bug"],["Keep your feet on the floor during the bicycle."]],
  ["Deep Core Reset","A gentle day for breath and control.",["90/90 breathing","Bird dog","Heel taps"],["Keep both feet down during breathing practice."]],
  ["Upper Core Connection","Curl from the ribs without tugging your neck.",["Reach crunch","Tabletop crunch","Forearm plank"],["Support your head lightly, or keep it down."]],
  ["Lower Core Progress","Add range only when the movement stays controlled.",["Toe taps","Reverse crunch","Leg extension"],["Extend one leg at a time."]],
  ["Standing Core","Meet yourself where you are, with no floor needed.",["Standing knee drive","Standing oblique crunch","Cross-body reach"],["Hold a wall for balance."]],
  ["Strong & Steady","Move around a stable center.",["Plank reach","Side plank hold","Bird dog"],["Keep knees down during the plank reach."]],
  ["Core Compression","Bring ribs and hips closer with control.",["Tuck crunch","Seated knee pull","Boat hold"],["Hold behind your thighs."]],
  ["Deep Core II","Keep the movement quiet and focused.",["Dead bug","Bear hover","Bird dog"],["Keep knees down for the bear hover."]],
  ["Oblique Endurance","Stay long through every side-body rep.",["Side plank dip","Cross-body crunch","Slow bicycle"],["Use a bent bottom knee for side plank."]],
  ["Halfway Check-In","Notice the strength you have already practiced.",["Hollow tuck","Forearm plank","Reverse crunch"],["Keep your feet down in the hollow tuck."]],
  ["Core Cardio","Bring a little rhythm while keeping form first.",["Mountain climber","Standing knee drive","Plank step"],["Step the climbers slowly."]],
  ["Lower Core Ladder","Build one clean layer at a time.",["Toe taps","Reverse crunch","Leg extension"],["Keep knees bent through every rep."]],
  ["Side Body Strength","Make space and strength through the waist.",["Side plank reach","Oblique crunch","Standing side reach"],["Do the side plank from your knee."]],
  ["Tempo Day","A slower count can make a small move matter.",["Reach crunch","Dead bug","Plank knee drive"],["Make the range smaller when control fades."]],
  ["Plank Progress","Hold steady as you change positions.",["Forearm plank","Shoulder taps","Plank reach"],["Elevate hands on a stable surface."]],
  ["Full Core Flow","Connect the moves and keep breathing.",["Dead bug","Slow bicycle","Plank step"],["Pause fully between each move."]],
  ["Deep Core III","Refine the control you have built.",["90/90 breathing","Bear hover","Bird dog"],["Keep both knees grounded in bear pose."]],
  ["Oblique Ladder","Return to your side body with confidence.",["Cross-body crunch","Side plank dip","Standing oblique crunch"],["Keep your bottom knee grounded."]],
  ["Lower Core Endurance","Stay supported as the effort builds.",["Toe taps","Bent-knee lowers","Reverse crunch"],["Return to tabletop between reps."]],
  ["Smooth Transitions","Practice a flow that does not need to be perfect.",["Reach crunch","Dead bug","Plank step"],["Take a breath between moves whenever needed."]],
  ["Plank Finishers","Short efforts, clean positions.",["High plank","Plank reach","Shoulder taps"],["Use a wall or counter."]],
  ["Time Under Tension","Stay with the slow part of each rep.",["Slow bicycle","Hollow tuck","Reverse crunch"],["Rest your feet on the floor between reps."]],
  ["Core Conditioning","Bring strength and rhythm together.",["Mountain climber","Tuck crunch","Plank step"],["Step every cardio move."]],
  ["Definition Circuit","Revisit the moves you now know well.",["Leg extension","Side plank hold","Slow bicycle"],["Choose a variation that lets you stay in control."]],
  ["Confidence Core","Notice what feels different from day one.",["Boat hold","Reverse crunch","Shoulder taps"],["Support your legs with your hands in boat hold."]],
  ["The Five-Minute Finale","Finish focused and take pride in returning.",["Dead bug","Slow bicycle","Forearm plank"],["Use any option that helps you finish feeling good."]]
];

const video14 = [
  ["Build Your Foundation","Find a strong starting position and learn the movement patterns."],
  ["Lower Core","Focus on controlled lower-core movement."],
  ["Oblique Sculpt","Move through your side body with intention."],
  ["Core Cardio","Add rhythm without losing your brace."],
  ["Slow Ab Burn","Let a slower tempo lead."],
  ["Deep Core + Recovery","Breathe, reconnect, and reset."],
  ["Halfway Ab Endurance","Meet the midpoint with steady strength."],
  ["Lower Core Progression","Build on your first lower-core session."],
  ["Oblique Definition","Return to rotation with more control."],
  ["Definition Conditioning","Bring strength and movement together."],
  ["Slow Tension","Make every second of a rep count."],
  ["Plank Strength","Build a steady full-core plank."],
  ["Full-Core Burner","Bring your favorite skills into one session."],
  ["The Final 14","Look back, finish strong, and notice what changed."]
];

window.ELIANA_BASE = {
  "30": core30.map((row,i)=>({day:i+1,title:row[0],focus:row[1],length:5,format:"Five rounds: 45 seconds moving, 15 seconds to transition",exercises:row[2],modifications:row[3],video:""})),
  "14": video14.map((row,i)=>({day:i+1,title:row[0],focus:row[1],length:null,format:"",exercises:[],modifications:[],video:""}))
};

window.ELIANA_MOVE_CUES = {
  "Reverse crunch":"Think of curling your hips up gently, rather than swinging your legs.",
  "Slow bicycle":"Rotate from your ribs and leave room between your chin and chest.",
  "Forearm plank":"Press the floor away and breathe; lower your knees whenever you need.",
  "Toe taps":"Keep your ribs soft and tap one foot down with control.",
  "Bent-knee lowers":"Keep knees bent and stop before your low back arches.",
  "Side plank hold":"Stack your shoulders and keep your bottom knee down if helpful.",
  "Cross-body crunch":"Turn through your upper body rather than yanking your elbow across.",
  "Dead bug":"Move slowly enough that your torso can stay quiet.",
  "High plank":"Keep shoulders over hands and make the stance wider for balance.",
  "Shoulder taps":"Shift as little as possible through your hips.",
  "Bird dog":"Reach long from fingertips to heel while keeping your trunk steady.",
  "Mountain climber":"Step each knee forward at the speed you can control.",
  "Hollow tuck":"Keep knees close and make the hold smaller if the back lifts.",
  "Boat hold":"Keep your chest lifted and hold behind your thighs if needed."
};
