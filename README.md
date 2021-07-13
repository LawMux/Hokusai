# Hokusai
A Browser Extension for Passively Recording Prior Art Patent Searches
# What is Hokusai?
Hokusai is a FireFox / Chrome browser extension which passively records prior art references encountered upon the [PATFT](https://patft.uspto.gov/) website as you browse.  Tracking references manually while browsing the website can be tedious and prone to error.  Hokusai, in contrast, passively generates the record for you.
# How does Hokusai work?
Whenever you visit one of:
* A page of patent search results
* A specific patent’s page
* A page of publication search results
* A specific publication’s page
Hokusai will collect all the US patents / publications, Foreign Patents / Publications, and Non-Patent references appearing on the page and integrate them into the search record.   This includes reconciliation: i.e., if a Patent and Publication refer to the same application, Hokusai will merge their appearances into a single entry in the search record.
# How do I install Hokusai?
There are generally two methods – either load the prebuilt Hokusai Zip into your browser, or load the unzipped folder by selecting the manifest file.  I’ll describe these methods with respect to FireFox – you can Google to find the equivalent in chrome.
By either method, direct your FireFox browser to 
[about:debugging#/runtime/this-firefox]( about:debugging#/runtime/this-firefox)
From here select “Load Temporary Add On” and then either 1) select the pre-zipped Hokusai.zip or 2) click on the manifest.json in the top-level directory of the download.

<kbd><img src="https://raw.githubusercontent.com/LawMux/Hokusai/main/tutorial_imgs/a-6.png" width="600" ></kbd>
# Quick Demo
Following activation, when you navigate to one of the PATFT webpages, you’ll see a control appear in the top-right corner as shown below.
![alt text]( https://raw.githubusercontent.com/LawMux/Hokusai/main/tutorial_imgs/a-0.png "PATFT Landing Page Post Activation")

The control indicates that Hokusai is recording the “default” search and is in passive mode.  During passive mode, references are acquired automatically, as you browse.  Under “active” mode you have to click “Collect” on each page that you want to acquire references (useful, e.g., if you want to limit the references you’ll have to review – as you’ll see, references accumulate quickly).
If you now navigate to a page upon which collection occurs, three additional menus will appear.  For example, if you go to the patent page for US PAT NO. 6,923,014, the center of the screen will show a count update:
![alt text]( https://raw.githubusercontent.com/LawMux/Hokusai/main/tutorial_imgs/a-1.png "First Encounter")
Here, Hokusai is telling you that it found 10 new US items and 3 new Foreign items and 0 non-patent items that it hadn’t seen before (if you refresh the page, these will all be 0 since the references are in the database now).  The notice will eventually move to the bottom left corner.
![alt text]( https://raw.githubusercontent.com/LawMux/Hokusai/main/tutorial_imgs/a-2.png "Quiescent" | width=300)
In the top left is a ranking tool for ranking the reference (you can decide what 0-3 meant to you – right now, all references start at 0).  Similarly, in the bottom right is a notepad (“this is a terrible/great reference!”).  Note that Hokusai performs cross-tab reconciliation for both of these menus.  That is, if you open a new tab for this page and make a note, that note will automatically appear in the previous tab.  Ditto the rank.
If you select “Menu” in the top right, you’ll be presented with the tab selection menu – initially, the Corpus Table is selected, indicating the list of US references for the current search.
![alt text]( https://raw.githubusercontent.com/LawMux/Hokusai/main/tutorial_imgs/a-3.png "Corpus Tab" )
Note that only references you’ve navigated to will be marked as “viewed.”  By selecting the drop-down in the top left, you can navigate away from the Corpus Table to the Searches Tab.
![alt text]( https://raw.githubusercontent.com/LawMux/Hokusai/main/tutorial_imgs/a-4.png "Searches Tab")
Here, you can create new search records, remove records, etc.  You can also export/import searches and sets of references via the various export buttons.
# What are passive / active modes?
In passive mode, Hokusai automatically checks references when you land on a page.
In active / “On Request” mode (shown below), you have to click “Collect” for the collection to be performed.
![alt text]( https://raw.githubusercontent.com/LawMux/Hokusai/main/tutorial_imgs/a-5.png "Active Mode" )

# Motivation
The “ideal” method for automating reference collection, as it facilitates quick and comprehensive review, would be to download  the USPTO bulk dataset and harvest references locally.  I did this.  However,  
* The dataset is large and unwieldly, of varying documentation formats, and prone to SQL insertion bugs 
* Successfully moving the database to a SQL server is something of a Pyrrhic victory, as updates and corrections will still need to be made manually 
Considering this, some developers may be motivated to automatically crawl the PATFT website for references.  I would advise against this for several reasons
* I’m not sure this is congruent with PATFT’s robot.txt
* It imposes an undesirable load on the PATFT servers.  Indeed, the servers sometimes bog down and I suspect it’s because some jerk somewhere is performing such a crawl. 
* A good prior art search requires an AI-complete (i.e., as good as a human) level of semantic review.  Automation is not always your friend in this regard.  So human-in-the-loop solutions are typically more preferable.
Hokusai strikes a happy middle ground.  A human semantic engine (you) is still driving the search and the extension imposes no additional load upon the PATFT server. 
 # How do I request features / suggest changes?
Email [james@jstechlaw.com](mailto:james@jstechlaw.com)
# Already planned / half-implemented features
* Force diagram representation of cross-reference relations
* Family representations
* Extend functionality to include ESPACE, WIPO, and other patent search sites
# License
The current version (as of 07/13/2021) is available under the AGPL with the additional following language:
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
Generally, do not incorporate Hokusai into a commercial product that you plan to distribute under any license other than the AGPL.  Frankly, if you’re so eager to produce a commercial product, appreciate that it’s not that challenging simply to rewrite the functionality from scratch.  However, recognize that the market for this sort of thing isn’t that huge ($15 a license . . . saturation by 150 law firms / search firms . . . so, ~$2K?  There’s a reason this is on GitHub :)) 
# DISCLAIMER / NO WARRANTY OR GUARANTEE OF COMPLETENESS OR ACCURACY
Prior Art searching is as much an art as a science.  Similarly, the PATFT website is buggy.  Accordingly, DO NOT RELY DISPOSITIVELY UPON HOKUSAI TO CAPTURE ALL THE REFERENCES YOU ENCOUNTER.  This is merely an assistive tool, not a guarantee of comprehensive collection.  Like any tool, it is imperfect.  You have been warned.



