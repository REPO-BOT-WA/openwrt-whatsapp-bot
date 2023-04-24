#!/bin/bash
interfaces=$(ubus list network.interface.*)
echo "{"
while IFS= read -r line; do
    data=$(ubus call $line status)
    echo "\"$line\"" : "$data",
done <<< "$interfaces"
echo "}"