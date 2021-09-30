import getBinExecutables from "./executables.js";
import path from "path"

export default function commandToArgv(command) {
  const argv = command.split(" ");
  
  const exeName = argv.length && argv[0];
  const matchingExePaths = getBinExecutables(exeName).filter(
    //if first arg is a path, then use that directly
    // otherwise, check matching filename of all bin executables
    (exePath) => exePath === exeName || exePath.split(path.sep).pop() === exeName
  );;
  
  //Store first exe path in case
  const foundMatch = matchingExePaths.length && matchingExePaths[0];
  const exePath = foundMatch ? foundMatch : "/bin/bash";

  //If default (echo, ls, etc.) then include the command.
  //If not, then don't include the command since converted to path.
  let args
  
  if (foundMatch) {
    //If there was a match, we can remove the entry
    args = argv.slice(1)
  } else {
    //When no match, pass it to /bin/bash to possibly figure out?
    //TODO God willing: We can whitelist some similar to child_process having ls regardless of PATH var.
    args = argv;
  }

  return ["node", exePath, ...args];
}